import { faArchive, faCheckCircle, faMinusSquare, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Sb_Checkbox from '../Sb_Checkbox/Sb_Checkbox';
import Sb_Text from '../Sb_Text/Sb_Text';
import './Sb_List_Item.css';

export type actionType = "REMOVE" | "UNSELECTED" | "SELECTED" | "CLICK";
export type compType = "SELECT" | "REMOVE" | "DISPLAY";

export interface Props {
    _id: string,
    text: string,
    type: "MEMBER" | "PROJECT",
    compType: compType,
    defaultSelectValue?: "UNSELECTED" | "SELECTED" | undefined,
    onAction: (id:string, actionType:actionType, text:string) => void
}

export default function Sb_List_Item (props:Props) {
    var {defaultSelectValue = "UNSELECTED"} = props;
    if (defaultSelectValue === undefined) defaultSelectValue = "UNSELECTED";
    if (props.compType === 'REMOVE') {
        return (
            <div className='d-flex sb-list-item list-remove'>
                <div className='d-inline-flex align-items-center' style={{'overflowWrap':'anywhere'}}>
                    <FontAwesomeIcon icon={props.type === 'MEMBER' ? faUserCircle : faArchive} 
                    style={{'fontSize':'1.3em', 'marginRight':'0.6em'}}/>
                    <Sb_Text font={16}>{props.text}</Sb_Text>
                </div>
                <FontAwesomeIcon icon={faMinusSquare} style={{'color': 'var(--DangerRed)','cursor':'pointer'}} 
                onClick={() => props.onAction(props._id, "REMOVE", props.text)}/>
            </div>
        )
    }
    else if (props.compType === 'SELECT' ) {
        return (
            <div className='d-flex sb-list-item list-select'>
                <div className='d-inline-flex align-items-center' style={{'overflowWrap':'anywhere'}}>
                    {/* There is something confusing in this component, it is returning the opposite. So i adapted. */}
                    <Sb_Checkbox default={defaultSelectValue} 
                    onChange={(checkState:boolean) => props.onAction(props._id, checkState ? 'UNSELECTED' : 'SELECTED', props.text)}/> 
                    <FontAwesomeIcon icon={props.type === 'MEMBER' ? faUserCircle : faArchive} 
                    style={{'fontSize':'1.3em', 'marginRight':'0.6em'}}/>
                    <Sb_Text font={16}>{props.text}</Sb_Text>
                </div>
            </div>
        )
    }
    else if (props.compType === 'DISPLAY' ) {
        return (
            <div className='d-flex sb-list-item list-display' style={{'overflowWrap':'anywhere'}}
             onClick={() => props.onAction(props._id, "CLICK", props.text)}>
                <div className='d-inline-flex align-items-center'>
                    <FontAwesomeIcon icon={props.type === 'MEMBER' ? faUserCircle : faArchive} 
                    style={{'fontSize':'1.3em', 'marginRight':'0.6em'}}/>
                    <Sb_Text font={16}>{props.text}</Sb_Text>
                </div>
            </div>
        )
    }
    else return null;
}