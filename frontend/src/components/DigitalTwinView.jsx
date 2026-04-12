import { DigitalTwinApp } from '../digital-twin/DigitalTwinApp';
import '../digital-twin/index.css';

export function DigitalTwinView() {
    return (
        <div className="digital-twin-root h-[calc(100vh-84px)] w-full overflow-hidden">
            <DigitalTwinApp />
        </div>
    );
}
