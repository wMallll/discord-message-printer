import { useEffect, useState } from "react";
import { wait } from "../utils/wait";
import "../styles/SplashScreen.css";

export default function SplashScreen() {
    const [logoAnimation, setLogoAnimation] = useState(false);
    const [hiddenOpacity, setHiddenOpacity] = useState(false);
    const [hiddenDisplay, setHiddenDisplay] = useState(false);
    useEffect(() => {
        (async () => {
            await wait(200);
            setLogoAnimation(true);
            await wait(1500);
            setHiddenOpacity(true);
            await wait(300);
            setHiddenDisplay(true);
            document.body.classList.remove("overflow-y-hidden");
        })();
    }, []);
    return (
        <div id="splash-screen" className={`${hiddenOpacity ? "opacity-0" : ""} ${hiddenDisplay ? "d-none" : ""}`}>
            <img src="static://assets/logo@3x.png" id={logoAnimation ? "animation" : ""} draggable="false" />
        </div>
    )
}