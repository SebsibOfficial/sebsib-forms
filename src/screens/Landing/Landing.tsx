import './Landing.css';
import Sb_Loader from '../../components/Sb_Loader';
import FormsLogo from '../../assets/formsLogo.png';
import { Button, Col, Row } from 'react-bootstrap';
import Sb_Questions, { QuestionI } from '../../components/Sb_Question/Sb_Question';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faFileUpload } from '@fortawesome/free-solid-svg-icons';
import { GetMetaInfo, GetSurvey, SendResponse } from '../../utils/api';
import { useParams } from 'react-router-dom';
import { encrypt, generateId, translateIds } from '../../utils/helpers';
import Sb_Text from '../../components/Sb_Text/Sb_Text';
import axios from 'axios';

interface AnswerI {
  _id: string,
  inputType: "TEXT" | "CHOICE" | "MULTI-SELECT" | "NUMBER" | "FILE" | "DATE",
  questionId: string,
  answer?: any
}

interface ResponsePayloadI {
  _id: string
  surveyId: string
  answers: AnswerI[]
  sentDate: string
}

interface MetaInfoI {
  responseId: string,
  projectName: string,
  shortOrgId: string,
}

export default function Landing() {
  let { link } = useParams();
  const [surveyId, setSurveyId] = useState("");
  const [surveyName, setSurveyName] = useState("");
  const [surveyDesc, setSurveyDesc] = useState("");
  const [shortSurveyId, setShortSurveyid] = useState("");
  const [metaInfo, setMetaInfo] = useState<MetaInfoI>();
  const [phase, setPhase] = useState<"INITIAL" | "FILLING" | "COMPLETE">("INITIAL")
  const [QS, setQS] = useState<QuestionI[]>([])
  const [ANS, setANS] = useState<AnswerI[]>([])
  const [DISP_STATE, SET_DISP_STATE] = useState<{id: string, disp: boolean}[]>([])
  const [pageLoading, setPageLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [pageOk, setPageOk] = useState(true);
  const [mandatoryFilled, setMandatoryFilled] = useState(false);
  const [fileCheckStat, setFileCheckStat] = useState(true);

  const handleResponse = (answer: string | string[] | object, id: string) => {
    var ANS_STATE_COPY = [...ANS]
    ANS_STATE_COPY.forEach((ans:AnswerI) => {
      if (ans.questionId == id) {
        ans.answer = answer
      }
    })
    setANS(ANS_STATE_COPY)
    QS.filter(q => q.id == id)[0].it == "CHOICE" || QS.filter(q => q.id == id)[0].it == "MULTI-SELECT" ? 
    updateShowPatternState() : null
  }

  const updateShowPatternState = () => {
    var DISP_STATE_COPY = [...DISP_STATE]
    var ANS_STATE_COPY = [...ANS]
    QS.forEach(question => {
      if (question.sh == true) {
        var theANS = ANS.filter(a => (question.shptrn?.answerId == a.answer || (a.answer as string[] ?? ['']).includes(question.shptrn?.answerId ?? '*')) && a.questionId == question.shptrn?.questionId)[0]
       
        if (theANS) {
          for (let i = 0; i < DISP_STATE_COPY.length; i++) {
            if (DISP_STATE_COPY[i].id == question.id) 
              DISP_STATE_COPY[i].disp = true
          }
        }
        else {
          for (let i = 0; i < DISP_STATE_COPY.length; i++) {
            if (DISP_STATE_COPY[i].id == question.id) {
              DISP_STATE_COPY[i].disp = false
              break;
            }
          }
          for (let j = 0; j < ANS_STATE_COPY.length; j++) {
            if (ANS_STATE_COPY[j].questionId == question.id) {
              delete ANS_STATE_COPY[j].answer;
              break;
            }            
          }
        }
      }
    })
    SET_DISP_STATE(DISP_STATE_COPY)
    setANS(ANS_STATE_COPY)
  }

  const lookUpDisp = (id: string) => {
    return DISP_STATE.filter(d => d.id == id)[0].disp
  }

  const isEmpty = (ans: any) => {
    if (typeof ans == 'string'){
      return ans.trim() === "" ? true : false
    }
    else
      false
  }

  const translateInputTypeAndClean = (ans: AnswerI[]) => {
    var ans_array: AnswerI[] = [];
    for (let index = 0; index < ans.length; index++) {
      var eachAnswer:any = ans[index];
      eachAnswer.inputType = translateIds("TEXT", eachAnswer.inputType);
      if (eachAnswer.answer === undefined || eachAnswer.answer === null)
        eachAnswer.answer = ''
      ans_array.push(eachAnswer);
    }
    return ans_array;
  }

  const mandatoryCheck = (Questions: QuestionI[], Answers: AnswerI[]) => {
   for (let index = 0; index < Questions.length; index++) {
    const element = Questions[index];
    var AnswerObj = Answers.filter((A: AnswerI) => A.questionId == element.id)[0];
    if (element.rq && (AnswerObj.answer === undefined || AnswerObj.answer === null || isEmpty(AnswerObj.answer)))
      return false;
   }
    return true
  }

  const fileCheck = (Answers: AnswerI[]) => {
    for (let index = 0; index < Answers.length; index++) {
     const element = Answers[index];
     if (element.inputType == "FILE" && element.answer !== null && element.answer !== undefined) {
      if (
        !["application/msword", 
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "image/jpeg",
          "video/mp4",
          "image/png",
          "application/pdf",
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "application/vnd.rar",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/zip",
          "text/plain"
        ].includes(element.answer.type) || element.answer.size > 1000000)
          return false
     }
    }
    return true
  }

  const GetSetMeta = () => {
    try {
      if (surveyId !== "") {
        GetMetaInfo(surveyId).then((result) => {
          if (result.code == 200) {
            setMetaInfo({
              responseId: generateId(),
              projectName: result.data.projectName,
              shortOrgId: result.data.shortOrgId
            })
          } else {
            console.log(result.data)
          }
        }) 
      }
    } catch (error) {
      console.log(error)
    }
  }

  const checkAndUploadFileType = async () => {
    // Upload pictures, if successfull -> set answers to upload path, if no -> return 0, if no files -> return 1
    var ANS_CPY = ANS;
    for (let index = 0; index < ANS_CPY.length; index++) {
      if (ANS_CPY[index].inputType === "FILE"){
        var toBeUploaded = ANS_CPY[index].answer;
        var nameOfFile = (toBeUploaded as any).name as string
        var ext = nameOfFile.split(".")[nameOfFile.split(".").length - 1]
        var formData = new FormData();
        formData.append("file", toBeUploaded);
        var tm = new Date().getTime();
        try {
          var resp = await axios({
            method: 'post',
            headers: {
              secKey: encrypt(tm+'')
            },
            url: 'http://localhost:3003/file/upload',
            params: {
              ext: ext,
              response: metaInfo?.responseId ?? '',
              project: metaInfo?.projectName ?? '',
              survey: shortSurveyId,
              account: metaInfo?.shortOrgId ?? ''
            },
            data: formData,
          })

          if (resp.status === 200) {
            ANS_CPY[index].answer = metaInfo?.shortOrgId+"/"+metaInfo?.projectName+"/"+shortSurveyId+"/"+metaInfo?.responseId+"/"+resp.data.fn;
            setANS(ANS_CPY);
          } 
          else {
            console.log(resp);
            return 0
          }
        } catch (error) {
          console.log(error);
          return 0
        }
      }
    }
    return 1
  }

  const submitResponse = async() => {
    setBtnLoading(true)
    if (!await checkAndUploadFileType()) {
      setBtnLoading(false)
      return console.log("FILE ERROR")
    }
    var ResponsePayload: ResponsePayloadI = {
      _id: generateId() as string,
      surveyId: surveyId,
      answers: translateInputTypeAndClean(ANS),
      sentDate: new Date().toISOString()
    }
    SendResponse(ResponsePayload).then((result) => {
      if (result.code == 200) {
        setBtnLoading(false)
        setPhase("COMPLETE")
      } else {
        console.log(result.data)
        setBtnLoading(false)
      }
    }).catch((err) => console.log(err))
  }
  
  const mapAnswers = (questions: any[]) => {
    var ANS_COPY = ANS;
    questions.forEach((qs: any) => {
      ANS_COPY.push({
        _id: generateId() as string,
        inputType: translateIds("ID", qs.inputType) as "TEXT" | "CHOICE" | "MULTI-SELECT" | "NUMBER" | "FILE" | "DATE",
        questionId: qs._id
      })
    })
    setANS(ANS_COPY);
  }

  const mapDisplay = (questions: any[]) => {
    var DISP_COPY = DISP_STATE;
    questions.forEach((qs: any) => {
      DISP_COPY.push({
        id: qs._id,
        disp: !qs.hasShowPattern
      })
    })
    SET_DISP_STATE(DISP_COPY);
  }

  const mapQuestions = (questions: any[]) => {
    var QS_COPY = QS;
    questions.forEach((qs: any) => {
      QS_COPY.push({
        id: qs._id,
        qs: qs.questionText,
        it: translateIds("ID", qs.inputType) as "TEXT" | "CHOICE" | "MULTI-SELECT" | "NUMBER" | "FILE" | "DATE",
        disp: true,
        sh: qs.hasShowPattern,
        rq: qs.mandatory,
        cs: qs.options,
        shptrn: qs.showIf,
        onResponse(answer, id, inp, act) {},
      })
    })
    setQS(QS_COPY);
  }

  useEffect(() => {
    GetSurvey(link ?? '').then((result) => {
      if (result.code == 200) {
        if (result.data.status == "STARTED"){
          setSurveyId(result.data._id);
          setShortSurveyid(result.data.shortSurveyId)
          setSurveyName(result.data.name);
          setSurveyDesc(result.data.description);
          mapDisplay(result.data.questions);
          mapAnswers(result.data.questions);
          mapQuestions(result.data.questions);
          setPageLoading(false)
          console.log(result.data.questions)
        }
        else {
          setPageOk(false)
          setPageLoading(false)
        }
      }
      else {
        setPageOk(false)
        setPageLoading(false)
        console.log(result.data)
      }
    })
    .catch((err) => console.error(err)) 
  }, [])

  useEffect(() => GetSetMeta(), [surveyId])

  // Check if mandatory fields are filled, listen to the Question and Answers
  useEffect(() => {
    setFileCheckStat(fileCheck(ANS))
    setMandatoryFilled(mandatoryCheck(QS, ANS))
  })


	return (
		<section className='landing-screen'>
      {
        !pageOk ? 
        <>
          <div className='four-oh-four-cont'>
            <div className='four-oh-four-div'>
              <p className='four-oh-four-p'>404</p>
              <Sb_Text>The Survey was not found</Sb_Text>
            </div>
          </div>
        </> :
        <>
        <Row className='logo-row'>
          <Col className='img-col'>
            <img src={FormsLogo} alt="" />
          </Col>
        </Row>
        {console.log("File",fileCheckStat, "Mand", mandatoryFilled)}
        <Row>
          <Col className='middle-form'>
            <div className='forms-thumbnail'>

            </div>
            <div className='main-content'>
              {
                pageLoading ? <Sb_Loader full/> :
                <>
                  <p className='mc-heading'>{surveyName}</p>
                  <div style={{'display':phase == "INITIAL" ? '' : 'none'}}>
                    <p>{surveyDesc}
                    </p>
                    <Button variant='primary' className='mt-3' onClick={() => setPhase("FILLING")}>Start</Button>
                  </div>
                  <div className='ques-container' style={{'display':phase == "FILLING" ? '' : 'none'}}>
                    <div style={{'transform':'translateY(-15px)', 'opacity':'0.8'}}><Sb_Text color='--DangerRed' font={24}>* </Sb_Text><Sb_Text font={12}> Questions are required</Sb_Text></div>
                    {
                      QS.map((ques, index) => (
                        <>
                          <Sb_Questions key={index} qs={ques.qs} it={ques.it} cs={ques.cs} sh={ques.sh} disp={lookUpDisp(ques.id)} id={ques.id} rq={ques.rq} onResponse={(ans, id) => handleResponse(ans, id)}/>
                          <div style={{'display': ques.it == "FILE" && !fileCheckStat ? '': 'none', 'transform':'translateY(-35px)'}}><Sb_Text color='--DangerRed' font={12}>File Type or Size Unsuitable</Sb_Text></div>
                        </>
                      )) 
                    }
                    <Button variant='primary' size='sm' style={{'float':'right'}} disabled={!(mandatoryFilled && fileCheckStat)} onClick={ mandatoryFilled && fileCheckStat ? () => submitResponse() : () => null}>{btnLoading ? <Sb_Loader/> : "Submit Response"}</Button>
                  </div>
                  <div style={{'display':phase == "COMPLETE" ? '' : 'none'}}>
                    <Row>
                      <Col style={{'display':'flex', 'alignItems':'center', 'marginBottom':'2em'}}>
                        <FontAwesomeIcon icon={faCheckCircle} style={{'marginRight':'10px', 'color':'var(--yellow)', 'fontSize':'20px'}}/>
                        <p style={{'margin':0}}>Response Submitted Successfully</p>
                      </Col>
                    </Row>
                    <Button variant='primary' size='sm' style={{'float':'left'}} onClick={() => location.reload()}>Submit Another Response</Button>
                  </div>
                  {/* <Sb_Loader full/> */} 
                </>
              }
            </div>
          </Col>
        </Row>
        </>
      }
		</section>
	)
}