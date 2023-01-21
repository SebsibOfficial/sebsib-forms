import './Sb_List.css';
import Sb_List_Item, {Props as Sb_List_Item_Props, actionType, compType} from '../Sb_List_Item/Sb_List_Item';

export type item = { _id:string, name:string, defaultSelectValue?:"UNSELECTED" | "SELECTED"};

interface Props {
    items: item[],
    listType: "MEMBER" | "PROJECT",
    compType: compType;
    onAction?: (id:string, text:string, actionType?:actionType) => void
}

export default function Sb_List (props:Props) {
    var {onAction = () => console.log("NOTHING")} = props;
    return (
        <div style={{'width':'100%'}}>
            {
                props.items.map((item:item) => (
                    <Sb_List_Item key={item._id} _id={item._id} compType={props.compType} 
                    type={props.listType} text={item.name} 
                    defaultSelectValue={item.defaultSelectValue}
                    onAction={(id:string, actionType:actionType, text:string) => onAction(id, text, actionType)}
                    />
                ))
            }
        </div>
    )
}