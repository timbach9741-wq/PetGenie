import { Project } from 'ts-morph';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const project = new Project({
    tsConfigFilePath: path.join(__dirname, "tsconfig.json")
  });

  const appFile = project.getSourceFileOrThrow("src/App.tsx");

  const componentsToRemove = [
    'CircularProgress', 'LanguageSwitcher', 'OnboardingScreen', 
    'LoginScreen', 'SignUpScreen', 'Navigation', 'StatusBar', 
    'AdBanner', 'SplashScreen', 'AuthScreens'
  ];

  const varStatements = appFile.getVariableStatements();
  
  let removedCount = 0;
  for (const statement of varStatements) {
    const decls = statement.getDeclarations();
    if (decls.length > 0) {
      const name = decls[0].getName();
      if (componentsToRemove.includes(name)) {
        console.log(`Removing ${name}...`);
        statement.remove();
        removedCount++;
      }
    }
  }

  if (removedCount > 0) {
    appFile.saveSync();
    console.log(`Successfully removed ${removedCount} inline components!`);
  } else {
    console.log('No inline components removed.');
  }
}

run().catch(err => {
  console.error(err);
});
