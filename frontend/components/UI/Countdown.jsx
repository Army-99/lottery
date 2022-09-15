import { useEffect, useState } from "react";
import { useCountdown } from "../../hooks/useCountdown";

const Countdown = () => {
    const [targetDate, setTargetDate] = useState(new Date());
    

    useEffect(() => {
        targetDate.setDate(targetDate.getDate() + 1);
        targetDate.setHours(0,0,0,0);
        console.log(targetDate)
    },[])
    
    const [days, hours, minutes, seconds] = useCountdown(targetDate);

    if(hours + minutes + seconds > 0){
        return(
            <div className="grid grid-flow-col gap-5 text-center auto-cols-max justify-center mt-10">
                <div className="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
                    <span className="countdown font-mono text-5xl">
                    <span>{hours.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}</span>
                    </span>
                    hours
                </div> 
                <div className="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
                    <span className="countdown font-mono text-5xl">
                    {/*<span style="--value:24;"></span>*/}
                    <span>{minutes.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}</span>
                    </span>
                    min
                </div> 
                <div className="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
                    <span className="countdown font-mono text-5xl">
                    <span>{seconds.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false})}</span>
                    </span>
                    sec
                </div>
            </div>
        )
    }else{
        <div className="flex justify-center mt-10">
            <h1 className="text-red-500">EXPIRED!</h1>
        </div>
    }
    
}

export default Countdown;