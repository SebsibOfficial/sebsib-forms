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
  sh: boolean,
  cs?: {
    _id: string,
    ct: string,
    dfv?: "UNSELECTED" | "SELECTED" | undefined
  }[],
  onResponse: (answer: string | string[], id: string, inp?: "CHOICE" | "MULTI-SELECT") => void
}

export default function Sb_Questions (props:QuestionI) {

  const inputRef = useRef<HTMLInputElement>(null);
  const [fileNameDisp, setFileNameDisp] = useState("");

  const handleFileChange = (e:any) => {
    const fileObj = e.target.files && e.target.files[0];
    if (!fileObj) {
      return;
    }
    setFileNameDisp(fileObj.name)
    //console.log('fileObj is', fileObj);

    // 👇️ reset file input
    e.target.value = null;

    // 👇️ is now empty
    //console.log(e.target.files);

    // 👇️ can still access file object here
    //console.log(fileObj);
    //console.log(fileObj.name);
  };

  const handleChoices = (id:string, text:string, grp:string, lst: "CHOICE" | "MULTI-SELECT", act: "UNSELECTED" | "SELECTED" | undefined) => {
    switch (lst) {
      case "CHOICE":
        if (act == "SELECTED") {

        }
        else {

        }
        break;
      case "MULTI-SELECT":
        if (act == "SELECTED") {

        }
        else {
          
        }
        break;
      default:
        break;
    }
  }

  const handleTextNumDates = (text: string, input: "TEXT" | "NUMBER" | "DATE") => {
    props.onResponse(text, props.id)
  }

  return (
    <div className="question-container" style={{'display': props.sh ? 'block' : 'none'}}>
      <Row>
        <Col className="question-text-holder">
          {props.qs}{<span style={{'color':'red','fontSize':'1.5em'}}>*</span>}
        </Col>
      </Row>
      <Row>
        <Col>
          {
            (props.it == 'CHOICE' || props.it == 'MULTI-SELECT') && 
              <Sb_List GroupId={"GRP"+props.id} listType={props.it} items={props.cs} 
              onAction={(id, text, grp, lst, act) => handleChoices(id, text, grp, lst, act)}/>
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