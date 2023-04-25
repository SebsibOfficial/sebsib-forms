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
import { encrypt, encryptPath, generateId, translateIds } from '../../utils/helpers';
import Sb_Text from '../../components/Sb_Text/Sb_Text';
import axios from 'axios';
import { blob } from 'stream/consumers';
import { config } from 'process';
// Interface for Answers
interface AnswerI {
  _id: string,
  inputType: "TEXT" | "CHOICE" | "MULTI-SELECT" | "NUMBER" | "FILE" | "DATE",
  questionId: string,
  answer?: any // Can be `string`, `string[]`, `object (File)` type
}
// Interface for the final response being sent
interface ResponsePayloadI {
  _id: string
  surveyId: string
  answers: AnswerI[]
  sentDate: string
}
// Interface for the Meta (addtional) information we get from the API
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
  const [surveyPic, setSurveyPic] = useState("");
  const [shortSurveyId, setShortSurveyid] = useState("");
  const [metaInfo, setMetaInfo] = useState<MetaInfoI>();
  const [phase, setPhase] = useState<"INITIAL" | "FILLING" | "COMPLETE">("INITIAL") /* The page has 3 states, INITIAL (Show survey desc), 
  FILLING (Show Question), COMPLETE (Option for another response)*/
  const [QS, setQS] = useState<QuestionI[]>([]) // (Question Array) Will hold all the Question objects
  const [ANS, setANS] = useState<AnswerI[]>([]) // (Answer Array) Will hold the list of Answer object without an `answer`, will be set later on `handleResponse`
  const [DISP_STATE, SET_DISP_STATE] = useState<{id: string, disp: boolean}[]>([]) // (Question Display Array) Controling what is to be dispalyed and not
  const [pageLoading, setPageLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [pageOk, setPageOk] = useState(true);
  const [mandatoryFilled, setMandatoryFilled] = useState(false);
  const [fileCheckStat, setFileCheckStat] = useState(true);
  
  /* 
    `handleResponse` 
    ----------------
    Gets triggered whenever a new answer input on the questions happens. It is bound to the
    `Sb_Questions` component which pass `id` and `answer` to handleResponse method. This function
    takes `id` and `answer` values and inserts `answer` in the answer array (ANS) respective of the `id`
  */
  const handleResponse = (answer: string | string[] | object, id: string) => {
    var ANS_STATE_COPY = [...ANS] // Copy state
    ANS_STATE_COPY.forEach((ans:AnswerI) => {
      if (ans.questionId == id) {
        ans.answer = answer // Insert answer in the respective Answer object
      }
    })
    setANS(ANS_STATE_COPY) // Update ANS state
    // If the questions that the input is given on are of `CHOICE` or `MULTI-SELECT` type: run the `updateShowPatternState` function
    QS.filter(q => q.id == id)[0].it == "CHOICE" || QS.filter(q => q.id == id)[0].it == "MULTI-SELECT" ?
    updateShowPatternState() : null
  }
  /* 
    `updateShowPatternState`
    -------------------------
    The purpose of this method is it turns questions visibility based on their show pattern.
    It loops through the question array and tries to find question who have a show pattern property, 
    If they do set the question visibilty in the `Question Display` Array according to the show pattern
  */
  const updateShowPatternState = () => {
    var DISP_STATE_COPY = [...DISP_STATE]
    var ANS_STATE_COPY = [...ANS]
    QS.forEach(question => {
      if (question.sh == true) {
        // To determine if the show pattern of the question is met
        var theANS = ANS.filter(a => (question.shptrn?.answerId == a.answer || (a.answer as string[] ?? ['']).includes(question.shptrn?.answerId ?? '*')) && a.questionId == question.shptrn?.questionId)[0]
        // If the show pattern is met
        if (theANS) {
          for (let i = 0; i < DISP_STATE_COPY.length; i++) {
            if (DISP_STATE_COPY[i].id == question.id) 
              DISP_STATE_COPY[i].disp = true
          }
        }
        // If pattern not met
        else {
          // Set the display of the question off/false
          for (let i = 0; i < DISP_STATE_COPY.length; i++) {
            if (DISP_STATE_COPY[i].id == question.id) {
              DISP_STATE_COPY[i].disp = false
              break;
            }
          }
          // Remove any previous answers
          for (let j = 0; j < ANS_STATE_COPY.length; j++) {
            if (ANS_STATE_COPY[j].questionId == question.id) {
              delete ANS_STATE_COPY[j].answer;
              break;
            }            
          }
        }
      }
    })
    // Update respective states
    SET_DISP_STATE(DISP_STATE_COPY)
    setANS(ANS_STATE_COPY)
  }
  // To know if the question should be shown or not, based on the `Question Display` Array
  const lookUpDisp = (id: string) => {
    return DISP_STATE.filter(d => d.id == id)[0].disp
  }
  // To know if the answers provided is an empty string or not
  const isEmpty = (ans: any) => {
    if (typeof ans == 'string'){
      return ans.trim() === "" ? true : false
    }
    else
      false
  }
  /*
    `translateInputTypeAndClean`
    ----------------------------
    It serves to translated the readable input types to Mongo ID eg, TEXT -> `632d54b08ba0b25104acb588`
    also assigns empty string to Answer objects which do not have answer properties. Returns the array
    of Answers after updating/translating
  */
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
  /*
    `mandatoryCheck`
    ---------------
    It checks if the question are mandatory and have answers filled out,
    If not it will return false
  */
  const mandatoryCheck = (Questions: QuestionI[], Answers: AnswerI[]) => {
   for (let index = 0; index < Questions.length; index++) {
    const element = Questions[index];
    var AnswerObj = Answers.filter((A: AnswerI) => A.questionId == element.id)[0];
    if (element.rq && (AnswerObj.answer === undefined || AnswerObj.answer === null || isEmpty(AnswerObj.answer)))
      return false;
   }
    return true
  }
  /*
    `allFilesCheck`
    ---------------
    It checks if there are questions with `FILE` input types and verifies that the
    file chosen is less than 2MB and file types are acceptable. Return false if it isnt
  */
  const allFilesCheck = (Answers: AnswerI[]) => {
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
        ].includes(element.answer.type) || element.answer.size > 2000000)
          return false
     }
    }
    return true
  }
  /*
    `fileCheck`
    ---------------
    It accepts Question Object and checks if the question's answer is a FILE type and that it is 
    suitable for upload. If not returns false
  */
  const fileCheck = (Ques: QuestionI) => {
    var answerObj = ANS.filter((ans) => ans.questionId === Ques.id)[0]
    if (answerObj.inputType == "FILE" && answerObj.answer !== null && answerObj.answer !== undefined) {
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
        ].includes(answerObj.answer.type) || answerObj.answer.size > 2000000)
          return false
    }
    return true
  }
  /*
    `GetSetMeta`
    ------------
    It takes the survey id, make an API call and retrieves/sets the Meta Info like
    Project Name, Short Organization Id. Also generates and sets responseId
  */
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
  /*
    `checkAndUploadFileType`
    ------------------------
    This method will loop through the answers in the `Answer` array and uploads the
    files selected from `FILE` type questions to the file server. It then updates the
    answer value in the `Answer` object for the related question to the path of the file 
    in the file server. 
    eg `FRORSA65/TURTORIAL PROJECT/ONLVEY91/63ff9f426ad9087b8e467ba8/eFiEgwds3esa.txt`
    It returns 1 if there is no issues, else returns 0.
  */
  const checkAndUploadFileType = async () => {
    var ANS_CPY = ANS;
    for (let index = 0; index < ANS_CPY.length; index++) {
      if (ANS_CPY[index].inputType === "FILE" && ANS_CPY[index].answer){
        var toBeUploaded = ANS_CPY[index].answer;
        var nameOfFile = (toBeUploaded as any).name as string
        var ext = nameOfFile.split(".")[nameOfFile.split(".").length - 1] // Get extention
        var formData = new FormData();
        formData.append("file", toBeUploaded); // Append the selected JS file object
        var tm = new Date().getTime();
        try {
          // Send to file server
          var resp = await axios({
            method: 'post',
            headers: {
              secKey: encrypt(tm+'')
            },
            url: process.env.NODE_ENV == "development" ? process.env.REACT_APP_DEV_FILE_SERVER_URL+"/file/upload" :  process.env.REACT_APP_FILE_SERVER_URL+"/file/upload",
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
  /*
    `submitResponse`
    ---------------
    Is the final step in filling the survey. Get trigger by the `Send reuqest button`
    It calls `checkAndUploadFileType` to upload file types, gathers the answers, and 
    sends them to the API.
  */
  const submitResponse = async() => {
    setBtnLoading(true) // Start loading icon on Btn
    // Upload the file types
    if (!await checkAndUploadFileType()) {
      setBtnLoading(false)
      return console.log("FILE ERROR")
    }
    var ResponsePayload: ResponsePayloadI = {
      _id: metaInfo?.responseId ?? '', // set reponse ID 
      surveyId: surveyId,
      answers: translateInputTypeAndClean(ANS), // Transalate the input types to mongo ID
      sentDate: new Date().toISOString() // Get timestamp
    }
    SendResponse(ResponsePayload).then((result) => {
      if (result.code == 200) {
        setBtnLoading(false) // Stop loading icon on Btn
        setPhase("COMPLETE") // Change the screen to completed screen
      } else {
        console.log(result.data)
        setBtnLoading(false)
      }
    }).catch((err) => console.log(err))
  }
  /*
    `mapAnswers`
    ------------
    It takes the response from the API, an array, and initializes the Answer Array
  */
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
  /*
    `mapDisplay`
    ------------
    It takes the response from the API, an array, and initializes the `Question Display` Array
  */
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
  /*
    `mapQuestions`
    ------------
    It takes the response from the API, an array, and initializes the `Question` Array
  */
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

  const GetSurveyPic = async (path: string) => {
    try {
      var resp = await axios.get(
      process.env.NODE_ENV == "development" ? 
        process.env.REACT_APP_DEV_FILE_SERVER_URL+"/file/surveypic/"+encryptPath(path) : 
        process.env.REACT_APP_FILE_SERVER_URL+"/file/surveypic/"+encryptPath(path),
      {responseType: 'blob'})
      if (resp.status == 200){
        const imageObjectURL = URL.createObjectURL(resp.data);
        setSurveyPic(imageObjectURL);
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Run on page load
  useEffect(() => {
    // Get survey data
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
          result.data.pic != "" ? GetSurveyPic(result.data.pic).then(r => {if (result.code == 200) setPageLoading(false)}) : setPageLoading(false)
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
  // Run when surveyId changes
  useEffect(() => GetSetMeta(), [surveyId])

  /* 
    Check if mandatory fields are filled and Files are suitable, 
    listen to changes in the Question and Answers array
  */
  useEffect(() => {
    setFileCheckStat(allFilesCheck(ANS))
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
            <div className='forms-thumbnail' style={{'background': surveyPic != "" ? 'url('+surveyPic+')' : "var(--primary)"}}>
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
                  {/* --------------------------------------------------------------------------------------------------------- */}
                  <div className='ques-container' style={{'display':phase == "FILLING" ? '' : 'none'}}>
                    <div style={{'transform':'translateY(-15px)', 'opacity':'0.8'}}><Sb_Text color='--DangerRed' font={24}>* </Sb_Text><Sb_Text font={12}> Questions are required</Sb_Text></div>
                    {
                      QS.map((ques, index) => (
                        <>
                          <Sb_Questions key={index} qs={ques.qs} it={ques.it} cs={ques.cs} sh={ques.sh} disp={lookUpDisp(ques.id)} id={ques.id} rq={ques.rq} onResponse={(ans, id) => handleResponse(ans, id)}/>
                          <div style={{'display': ques.it == "FILE" && !fileCheck(ques) ? '': 'none', 'transform':'translateY(-35px)'}}><Sb_Text color='--DangerRed' font={12}>File Type or Size Unsuitable</Sb_Text></div>
                        </>
                      )) 
                    }
                    <Button variant='primary' size='sm' style={{'float':'right'}} disabled={!(mandatoryFilled && fileCheckStat)} onClick={ mandatoryFilled && fileCheckStat ? () => submitResponse() : () => null}>{btnLoading ? <Sb_Loader/> : "Submit Response"}</Button>
                  </div>
                  {/* ------------------------------------------------------------------------------------------------------------ */}
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