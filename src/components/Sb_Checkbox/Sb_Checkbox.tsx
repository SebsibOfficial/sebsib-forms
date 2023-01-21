import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
/* eslint-disable */
// @ts-ignore
import Checkbox from 'react-custom-checkbox';
/* eslint-enable */

interface Props {
    default:"UNSELECTED" | "SELECTED",
    disabled?: boolean,
    onChange:Function
}

export default function Sb_Checkbox (props:Props) {
    const [checkState, setCheckState] = useState<boolean>();
    var { disabled = false } = props;

    useEffect(() => {
        setCheckState(props.default === 'UNSELECTED' ? false : true)
    },[props.default])

    return (
        <Checkbox name="my-input" 
            checked={checkState} 
            style={{'marginRight':'0.5em'}} 
            borderColor="var(--secondary)"
            borderRadius={20}
            disabled={disabled}
            icon={<FontAwesomeIcon icon={faCheckCircle} color="var(--primary)" style={{fontSize:20}}/>}
            //setState is not changing the state, idk why. Something freaky is going on this component or im dumb.
            onChange={
               () => {setCheckState(!checkState); props.onChange(checkState);}
            }
        />
    )
}