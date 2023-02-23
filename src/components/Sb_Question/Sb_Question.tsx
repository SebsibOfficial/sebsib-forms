import { faFile, faFileUpload } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button, Col, Form, Row } from "react-bootstrap"
import {useRef, useState} from 'react';
import Sb_List from "../Sb_List/Sb_List"
import Sb_Text from "../Sb_Text/Sb_Text"
import './Sb_Question.css'

export interface QuestionI {
  id: string,
  qs: string,
  it: "TEXT" | "CHOICE" | "MULTI-SELECT" | "NUMBER" | "FILE" | "DATE",
  disp: boolean,
  sh: boolean,
  shptrn?: {
    questionId: string,
    answerId: string,
    responseId: string
  }
  rq: boolean,
  cs?: {
    _id: string,
    text: string,
    dfv?: "UNSELECTED" | "SELECTED" | undefined
  }[],
  onResponse: (answer: string | string[] | object, id: string, inp?: "CHOICE" | "MULTI-SELECT", act?: "UNSELECTED" | "SELECTED" | undefined) => void
}

export default function Sb_Questions (props:QuestionI) {

  const inputRef = useRef<HTMLInputElement>(null);
  const [fileNameDisp, setFileNameDisp] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const handleFileChange = (e:any) => {
    const fileObj = e.target.files && e.target.files[0];
    if (!fileObj) {
      return;
    }
    setFileNameDisp(fileObj.name)
    props.onResponse(fileObj, props.id)
  };

  const handleRadio = (e:any) => {
    props.onResponse(e.target.value, props.id)
  }

  const handleChecks = (e:any) => {
    var selectState = selected
    if (e.target.checked) {
      selectState.push(e.target.value);
      setSelected(selectState);
    } 
    else {
      setSelected(selectState.filter((s) => s != e.target.value))
    }
    props.onResponse(selected, props.id)
  }

  const handleTextNumDates = (text: string, input: "TEXT" | "NUMBER" | "DATE") => {
    props.onResponse(text, props.id)
  }

  return (
    <div className="question-container" style={{'display': props.disp ? 'block' : 'none'}}>
      <Row>
        <Col className="question-text-holder">
          {props.qs}{<span style={{'color':'red','fontSize':'1.5em', 'display': props.rq ? '' : 'none'}}>*</span>}
        </Col>
      </Row>
      <Row>
        <Col>
          {
            (props.it == 'CHOICE') && 
            <>
              <Form onChange={(e) => handleRadio(e)}>
              {
                props.cs?.map((ch, index) => (
                  <Form.Check 
                    type={"radio"} 
                    key = {index} 
                    name={props.id} 
                    label={ch.text} 
                    value={ch._id}
                    id={ch._id}/>
                ))
          
              }
              </Form>
            </>
          }
          {
            (props.it == 'MULTI-SELECT') && 
            <>
              <Form onChange={(e) => handleChecks(e)}>
              {
                props.cs?.map((ch, index) => (
                  <Form.Check 
                    type={"checkbox"} 
                    key = {index} 
                    name={props.id} 
                    label={ch.text} 
                    value={ch._id}
                    id={ch._id}/>
                ))
          
              }
              </Form>
            </>
          }
          {
            props.it == 'TEXT' && 
            <>
              <Form.Group>
                <textarea name="question" id="" cols={40} rows={2} className="question-text-area" style={{'fontSize':'12px', 'padding':'1em'}}
                onChange={(e) => handleTextNumDates(e.target.value, 'TEXT')}></textarea>
              </Form.Group>
            </>
          }
          {
            props.it == 'NUMBER' && 
            <Form.Group controlId="ChoiceOption">
              <Form.Control size="sm" type="number" placeholder="Number" 
              onChange={(e) => handleTextNumDates(e.target.value, 'NUMBER')}/>
            </Form.Group>
          }
          {
            props.it == 'DATE' && 
            <>
              <Form.Group>
              <Form.Control size="sm" type="date" placeholder="MM/DD/YYYY" 
              onChange={(e) => handleTextNumDates(e.target.value, 'DATE')}/>
              </Form.Group>
            </>
          }
          {
            props.it == 'FILE' && 
            <div>
              <input
                type="file"
                ref={inputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <Button onClick={() => inputRef.current?.click()} variant="secondary" size="sm" style={{'marginRight':'1em'}} >
                <FontAwesomeIcon icon={faFileUpload} style={{'marginRight':'10px'}}/>
                File Upload
              </Button>
              <Sb_Text>{fileNameDisp}</Sb_Text>
            </div>
          }
        </Col>
      </Row>
    </div>
  )
}