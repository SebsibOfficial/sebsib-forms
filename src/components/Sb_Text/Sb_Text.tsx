import './Sb_Text.css';

interface Props {
   font?: 12 | 16 | 20 | 24 | 32 | 48 | 72,
   weight?: 300 | 400 | 500 | 600 | 900,
   color?: "--lightGrey" | "--secondary" | "--primary" | "--DangerRed",
   align?: "center" | "right" | "left",
   clamp?: number,
   children:  any
}

export default function Sb_Text(props:Props){
    // Set defaults
    var { font = 12, color = "--secondary", align = "left"} = props;
    return <div style={
        {'fontSize':font, 
        'color':`var(${color})`, 
        'fontWeight':props.weight,
        'textAlign':align,
        }} 
        className = { props.clamp ? `hv clamp c-${props.clamp}` : 'hv'}> 
        {props.children} 
    </div>
}