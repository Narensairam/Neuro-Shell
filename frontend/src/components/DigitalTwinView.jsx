import { DigitalTwinApp } from '../digital-twin/DigitalTwinApp';
import '../digital-twin/index.css';

export function DigitalTwinView() {
    return (
        <div className="digital-twin-root flex flex-col min-h-0 h-full w-full overflow-hidden">
            <DigitalTwinApp />
        </div>
    );
}
