import { createRoot } from 'react-dom/client';
import { MainApp } from './components/MainApp';

import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";

import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-one_dark";
import "ace-builds/src-noconflict/ext-language_tools";

import "./styles/globals.css";

const root = createRoot(document.getElementById("root")!);
root.render(<MainApp />);