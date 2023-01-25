import './Landing.css';
import Sb_Loader from '../../components/Sb_Loader';
import FormsLogo from '../../assets/formsLogo.png';
import { Button, Col, Row } from 'react-bootstrap';
import Sb_Questions, { QuestionI } from '../../components/Sb_Question/Sb_Question';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faFileUpload } from '@fortawesome/free-solid-svg-icons';

export default function Landing() {
  const [QS, setQS] = useState<QuestionI[]>([
    {
      id: "1",
      qs: "First Question",
      it: "TEXT",
      sh: true,
      onResponse(){}
    },
    {
      id: "2",
      qs: "Second Question",
      it: "CHOICE",
      cs: [{_id: "2c1", ct: "CHICE ONE"},{_id: "2c2", ct: "CHICE TWO"}],
      sh: true,
      onResponse(){}
    },
    {
      id: "3",
      qs: "Third Question",
      it: "MULTI-SELECT",
      cs: [{_id: "3c1", ct: "CHICE ONE"},{_id: "3c2", ct: "CHICE TWO"}],
      sh: true,
      onResponse(){}
    },
    {
      id: "4",
      qs: "Six Question",
      it: "NUMBER",
      sh: true,
      onResponse(){}
    },
    {
      id: "5",
      qs: "Sevens Question",
      it: "DATE",
      sh: true,
      onResponse(){}
    },
    {
      id: "6",
      qs: "8th Question",
      it: "FILE",
      sh: true,
      onResponse(){}
    },
  ])

  const handleResponse = (ans: string | string[], id: string, input?: "CHOICE" | "MULTI-SELECT") => {
    // Handle the choice conundrum here
    console.log(ans, id)
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
            <div style={{'display':'none'}} className='ques-container'>
              {
                QS.map((ques, index) => (
                  <Sb_Questions qs={ques.qs} it={ques.it} cs={ques.cs} sh={ques.sh} id={index+''} onResponse={(ans, id, inp) => handleResponse(ans, id, inp)}/>
                )) 
              }
              <Button variant='primary' size='sm' style={{'float':'right'}}>Submit Response</Button>
            </div>
            <div>
              <Row>
                <Col style={{'display':'flex', 'alignItems':'center', 'marginBottom':'2em'}}>
                  <FontAwesomeIcon icon={faCheckCircle} style={{'marginRight':'10px', 'color':'var(--yellow)', 'fontSize':'20px'}}/>
                  <p style={{'margin':0}}>Response Submitted Successfully</p>
                </Col>
              </Row>
              <Button variant='primary' size='sm' style={{'float':'left'}}>Submit Another Response</Button>
            </div>
          </div>
        </Col>
      </Row>
		</section>
	)
}