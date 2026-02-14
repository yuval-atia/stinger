import TimestampCard from '../components/Convert/TimestampCard';
import JsonYamlCard from '../components/Convert/JsonYamlCard';
import CaseConverterCard from '../components/Convert/CaseConverterCard';
import NumberBaseCard from '../components/Convert/NumberBaseCard';
import ColorConverterCard from '../components/Convert/ColorConverterCard';
import ByteSizeCard from '../components/Convert/ByteSizeCard';
import CronParserCard from '../components/Convert/CronParserCard';
import RegexTesterCard from '../components/Convert/RegexTesterCard';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

function ConvertPage() {
  useDocumentTitle('Timestamp, Color & Unit Converters');
  return (
    <div className="h-full overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
        <TimestampCard />
        <JsonYamlCard />
        <CaseConverterCard />
        <NumberBaseCard />
        <ColorConverterCard />
        <ByteSizeCard />
        <CronParserCard />
        <RegexTesterCard />
      </div>
    </div>
  );
}

export default ConvertPage;
