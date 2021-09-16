

import { API } from "../../backend/bridge";

declare global {
    interface Window {api: typeof API}
}

