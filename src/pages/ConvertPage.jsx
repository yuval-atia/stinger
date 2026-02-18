import TimestampCard from '../components/Convert/TimestampCard';
import JsonYamlCard from '../components/Convert/JsonYamlCard';
import CaseConverterCard from '../components/Convert/CaseConverterCard';
import NumberBaseCard from '../components/Convert/NumberBaseCard';
import ColorConverterCard from '../components/Convert/ColorConverterCard';
import ByteSizeCard from '../components/Convert/ByteSizeCard';
import CronParserCard from '../components/Convert/CronParserCard';
import RegexTesterCard from '../components/Convert/RegexTesterCard';
import CsvJsonCard from '../components/Convert/CsvJsonCard';
import ChmodCalculatorCard from '../components/Convert/ChmodCalculatorCard';
import JsonToTsCard from '../components/Convert/JsonToTsCard';
import HtmlToJsxCard from '../components/Convert/HtmlToJsxCard';
import ContrastCheckerCard from '../components/Convert/ContrastCheckerCard';

function ConvertPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
        <TimestampCard />
        <JsonYamlCard />
        <CsvJsonCard />
        <CaseConverterCard />
        <NumberBaseCard />
        <ColorConverterCard />
        <ByteSizeCard />
        <CronParserCard />
        <RegexTesterCard />
        <ChmodCalculatorCard />
        <JsonToTsCard />
        <HtmlToJsxCard />
        <ContrastCheckerCard />
      </div>
    </div>
  );
}

export default ConvertPage;
