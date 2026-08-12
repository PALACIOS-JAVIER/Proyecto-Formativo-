const fs = require('fs');
const path = require('path');

const emojiMap = {
  '📊': '<FiPieChart />',
  '📁': '<FiFolder />',
  '📂': '<FiFolder />',
  '🗂️': '<FiFolder />',
  '📈': '<FiTrendingUp />',
  '📉': '<FiTrendingDown />',
  '🔔': '<FiBell />',
  '⚙️': '<FiSettings />',
  '🔄': '<FiRefreshCw />',
  '🔎': '<FiSearch />',
  '🧾': '<FiFileText />',
  '📄': '<FiFileText />',
  '📘': '<FiBook />',
  '📗': '<FiBook />',
  '📝': '<FiEdit />',
  '📥': '<FiDownload />',
  '👥': '<FiUsers />',
  '🕘': '<FiClock />',
  '⏳': '<FiClock />',
  '⚠️': '<FiAlertTriangle />',
  '🤖': '<FiCpu />',
  '💡': '<FiInfo />',
  '✅': '<FiCheck />',
  '✓': '<FiCheck />',
  '❌': '<FiX />',
  '📅': '<FiCalendar />',
  '🏆': '<FiAward />',
  '💸': '<FiDollarSign />',
  '🎉': '<FiSmile />',
  '🌙': '<FiMoon />',
  '☀️': '<FiSun />',
  '🚀': '<FiSend />'
};

const iconNames = new Set(Object.values(emojiMap).map(s => s.replace('<', '').replace(' />', '')));
// Add specific imports we might need
iconNames.add('FiPieChart');
iconNames.add('FiFolder');
iconNames.add('FiTrendingUp');
iconNames.add('FiTrendingDown');
iconNames.add('FiBell');
iconNames.add('FiSettings');
iconNames.add('FiRefreshCw');
iconNames.add('FiSearch');
iconNames.add('FiFileText');
iconNames.add('FiBook');
iconNames.add('FiEdit');
iconNames.add('FiDownload');
iconNames.add('FiUsers');
iconNames.add('FiClock');
iconNames.add('FiAlertTriangle');
iconNames.add('FiCpu');
iconNames.add('FiInfo');
iconNames.add('FiCheck');
iconNames.add('FiX');
iconNames.add('FiCalendar');
iconNames.add('FiAward');
iconNames.add('FiDollarSign');
iconNames.add('FiSmile');
iconNames.add('FiMoon');
iconNames.add('FiSun');
iconNames.add('FiSend');


const files = [
  'C:\\Users\\Emiliano Arcos\\Desktop\\Proyecto-Formativo-\\frontend\\src\\componentes\\common\\ThemeToggle.tsx',
  'C:\\Users\\Emiliano Arcos\\Desktop\\Proyecto-Formativo-\\frontend\\src\\componentes\\Coordinador\\Dashboard\\dashboard.tsx',
  'C:\\Users\\Emiliano Arcos\\Desktop\\Proyecto-Formativo-\\frontend\\src\\componentes\\Coordinador\\Historial\\historial.tsx',
  'C:\\Users\\Emiliano Arcos\\Desktop\\Proyecto-Formativo-\\frontend\\src\\componentes\\Coordinador\\Instructores\\instructores.tsx',
  'C:\\Users\\Emiliano Arcos\\Desktop\\Proyecto-Formativo-\\frontend\\src\\componentes\\Coordinador\\Reportes\\reportes.tsx',
  'C:\\Users\\Emiliano Arcos\\Desktop\\Proyecto-Formativo-\\frontend\\src\\componentes\\Instructor\\CargarInforme\\CargarInforme.tsx',
  'C:\\Users\\Emiliano Arcos\\Desktop\\Proyecto-Formativo-\\frontend\\src\\componentes\\Instructor\\GraficaIndicadores\\Dashboard\\Dashboard.tsx',
  'C:\\Users\\Emiliano Arcos\\Desktop\\Proyecto-Formativo-\\frontend\\src\\componentes\\Instructor\\Notificaciones\\Notificaciones.tsx',
  'C:\\Users\\Emiliano Arcos\\Desktop\\Proyecto-Formativo-\\frontend\\src\\componentes\\Instructor\\Perfil\\Perfil.tsx',
  'C:\\Users\\Emiliano Arcos\\Desktop\\Proyecto-Formativo-\\frontend\\src\\componentes\\Instructor\\WhatsApp\\WhatsApp.tsx',
  'C:\\Users\\Emiliano Arcos\\Desktop\\Proyecto-Formativo-\\frontend\\src\\login\\Login.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  let usedIcons = new Set();

  for (const [emoji, component] of Object.entries(emojiMap)) {
    if (content.includes(emoji)) {
      // Need to replace all instances
      // Simple split/join replacement
      content = content.split(emoji).join(component);
      usedIcons.add(component.replace('<', '').replace(' />', ''));
      modified = true;
    }
  }

  // Also catch generic ✅ and others if they were not caught by specific encoding string formats
  // but split/join usually works perfectly with unicode characters in node js readFileSync

  if (modified) {
    // Add import statement if we used any icon
    if (usedIcons.size > 0) {
      const importStr = `import { ${Array.from(usedIcons).join(', ')} } from 'react-icons/fi';\n`;
      // Insert after the first import or at the top
      if (!content.includes('react-icons/fi')) {
        const lines = content.split('\n');
        let insertIndex = 0;
        // Find last import
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('import ')) {
            insertIndex = i + 1;
          } else if (lines[i].trim() !== '' && !lines[i].startsWith('import') && insertIndex > 0) {
            break;
          }
        }
        lines.splice(insertIndex, 0, importStr);
        content = lines.join('\n');
      } else {
        // If it already has react-icons import, we'd need to parse it, but for simplicity we can just add a new one, webpack merges them
        content = importStr + content;
      }
    }
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${path.basename(file)}`);
  }
}
