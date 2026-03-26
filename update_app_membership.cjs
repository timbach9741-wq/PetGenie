const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add import
if (!content.includes("import MembershipScreen from './components/screens/MembershipScreen';")) {
  content = content.replace("import AIVetScreen from './components/screens/AIVetScreen';", "import AIVetScreen from './components/screens/AIVetScreen';\nimport MembershipScreen from './components/screens/MembershipScreen';");
}

// Remove the hardcoded component
const startString = "const MembershipScreen = ({ onBack, onUpgrade }: { onBack: () => void, onUpgrade: () => void }) => {";
const endString = "const AnalysisLoadingOverlay = () => {";

const startIndex = content.indexOf(startString);
const endIndex = content.indexOf(endString);

if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
  content = content.substring(0, startIndex) + content.substring(endIndex);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Success: Replaced App.tsx contents.');
} else {
  console.log('Failed: Could not find markers.', startIndex, endIndex);
}
