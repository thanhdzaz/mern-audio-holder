import App from "./app.js";
import { createRoot } from "react-dom/client";
import { ConfigProvider, theme } from "antd";


const domNode = document.getElementById('root');
const root = createRoot(domNode);

root.render(
    <ConfigProvider

    >
        <App />
    </ConfigProvider>
)