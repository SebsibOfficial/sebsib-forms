import Sb_Checkbox from '../Sb_Checkbox/Sb_Checkbox';
import Sb_Text from '../Sb_Text/Sb_Text';
import './Sb_List_Item.css';

export type actionType = "UNSELECTED" | "SELECTED";
export type compType = "SELECT" | "REMOVE" | "DISPLAY";

export interface Props {
    _id: string,
    text: string,
    defaultSelectValue?: "UNSELECTED" | "SELECTED" | undefined,
    onAction: (id:string, actionType:actionType, text:string) => void
}

export default function Sb_List_Item (props:Props) {
    var {defaultSelectValue = "UNSELECTED"} = props;
    if (defaultSelectValue === undefined) defaultSelectValue = "UNSELECTED";
    return (
      <div className='d-flex sb-list-item list-select'>
        <div className='d-inline-flex align-items-center' style={{'overflowWrap':'anywhere'}}>
          {/* There is something confusing in this component, it is returning the opposite. So i adapted. */}
          <Sb_Checkbox default={defaultSelectValue} 
          onChange={(checkState:boolean) => props.onAction(props._id, checkState ? 'UNSELECTED' : 'SELECTED', props.text)}/> 
          <Sb_Text font={12}>{props.text}</Sb_Text>
        </div>
      </div>
  )
}