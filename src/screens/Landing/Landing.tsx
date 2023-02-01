import './Landing.css';
import Sb_Loader from '../../components/Sb_Loader';
import FormsLogo from '../../assets/formsLogo.png';
import { Button, Col, Row } from 'react-bootstrap';
import Sb_Questions, { QuestionI } from '../../components/Sb_Question/Sb_Question';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faFileUpload } from '@fortawesome/free-solid-svg-icons';

interface AnswerI {
  _id: string,
  inputType: "TEXT" | "CHOICE" | "MULTI-SELECT" | "NUMBER" | "FILE" | "DATE",
  questionId: string,
  answer?: string | string[] | object
}

export default function Landing() {
  const [QS, setQS] = useState<QuestionI[]>([
    {
      id: "1",
      qs: "First Question",
      it: "TEXT",
      disp: true,
      sh: false,
      rq: false,
      onResponse(){}
    },
    {
      id: "2",
      qs: "Second Question",
      it: "CHOICE",
      cs: [{_id: "2c1", ct: "CHICE ONE", dfv: "UNSELECTED"},{_id: "2c2", ct: "CHICE TWO", dfv: "UNSELECTED"},{_id: "2c3", ct: "CHICE THree", dfv: "UNSELECTED"}],
      sh: false,
      rq: true,
      disp: true,
      onResponse(){}
    },
    {
      id: "3",
      qs: "Third Question",
      it: "MULTI-SELECT",
      cs: [{_id: "3c1", ct: "CHICE ONE", dfv: "UNSELECTED"},{_id: "3c2", ct: "CHICE TWO", dfv: "UNSELECTED"},{_id: "3c3", ct: "CHICE THree", dfv: "UNSELECTED"}],
      sh: true,
      disp: false,
      shptrn: {
        answerId: "2c1",
        questionId: "2",
        responseId: "1"
      },
      rq: true,
      onResponse(){}
    },
    {
      id: "4",
      qs: "Six Question",
      it: "NUMBER",
      sh: false,
      rq: true,
      disp: true,
      onResponse(){}
    },
    {
      id: "5",
      qs: "Sevens Question",
      it: "DATE",
      sh: false,
      rq: true,
      disp: true,
      onResponse(){}
    },
    {
      id: "6",
      qs: "8th Question",
      it: "FILE",
      sh: true,
      shptrn: {
        answerId: "3c1",
        questionId: "3",
        responseId: "1"
      },
      rq: true,
      disp: false,
      onResponse(){}
    },
  ])
  const [ANS, setANS] = useState<AnswerI[]>([
    {
      _id: "12",
      inputType: "TEXT",
      questionId: "1",
    },
    {
      _id: "13",
      inputType: "CHOICE",
      questionId: "2",
    },
    {
      _id: "14",
      inputType: "MULTI-SELECT",
      questionId: "3",
    },
    {
      _id: "15",
      inputType: "NUMBER",
      questionId: "4",
    },
    {
      _id: "16",
      inputType: "DATE",
      questionId: "5",
    },
    {
      _id: "17",
      inputType: "FILE",
      questionId: "6",
    }
  ])
  const [DISP_STATE, SET_DISP_STATE] = useState<{id: string, disp: boolean}[]>([
    {
      id: "1",
      disp: true,
    },
    {
      id: "2",
      disp: true,
    },
    {
      id: "3",
      disp: false,
    },
    {
      id: "4",
      disp: true,
    },
    {
      id: "5",
      disp: true,
    },
    {
      id: "6",
      disp: false,
    },
  ])

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

  const submitResponse = () => {
    console.log(ANS)
  }
  
	return (
		<section className='landing-screen'>
      <Row className='logo-row'>
        <Col className='img-col'>
          <img src={FormsLogo} alt="" />
        </Col>
      </Row>
      <Row>
        <Col className='middle-form'>
          <div className='forms-thumbnail'>

          </div>
          <div className='main-content'>
            <p className='mc-heading'>Global Entrepreneurship Study: Addis Ababa Start Up Index</p>
            <div style={{'display':'none'}}>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut 
                labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut 
                aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
                fugiat nulla pariatur. Excepteur sint occaecat 
                cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum
              </p>
              <Button variant='primary' className='mt-3'>Start</Button>
            </div>
            <div className='ques-container'>
              {
                QS.map((ques, index) => (
                  <Sb_Questions key={index} qs={ques.qs} it={ques.it} cs={ques.cs} sh={ques.sh} disp={lookUpDisp(ques.id)} id={ques.id} rq={ques.rq} onResponse={(ans, id) => handleResponse(ans, id)}/>
                )) 
              }
              <Button variant='primary' size='sm' style={{'float':'right'}} onClick={() => submitResponse()}>Submit Response</Button>
            </div>
            <div style={{'display':'none'}}>
              <Row>
                <Col style={{'display':'flex', 'alignItems':'center', 'marginBottom':'2em'}}>
                  <FontAwesomeIcon icon={faCheckCircle} style={{'marginRight':'10px', 'color':'var(--yellow)', 'fontSize':'20px'}}/>
                  <p style={{'margin':0}}>Response Submitted Successfully</p>
                </Col>
              </Row>
              <Button variant='primary' size='sm' style={{'float':'left'}}>Submit Another Response</Button>
            </div>
            {/* <Sb_Loader full/> */}
          </div>
        </Col>
      </Row>
		</section>
	)
}