import './Sb_List.css';
import Sb_List_Item, {Props as Sb_List_Item_Props, actionType, compType} from '../Sb_List_Item/Sb_List_Item';

export type item = { _id:string, ct:string, defaultSelectValue?:"UNSELECTED" | "SELECTED"};

interface Props {
    items?: item[],
    listType: "MULTI-SELECT" | "CHOICE",
    GroupId: string,
    onAction?: (id:string, text:string, group:string, listType: "MULTI-SELECT" | "CHOICE", actionType?:"UNSELECTED" | "SELECTED") => void
}

export default function Sb_List (props:Props) {
    var {onAction = () => console.log("NOTHING")} = props;
    return (
        <div style={{'width':'100%'}}>
            {
                props.items?.map((item:item) => (
                    <Sb_List_Item key={item._id} _id={item._id} 
                    text={item.ct} 
                    defaultSelectValue={item.defaultSelectValue}
                    onAction={(id:string, actionType:"UNSELECTED" | "SELECTED", text:string) => onAction(id, text, props.GroupId, props.listType, actionType)}
                    />
                ))
            }
        </div>
    )
}