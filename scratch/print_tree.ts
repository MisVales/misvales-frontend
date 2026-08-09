import { PROFILES } from '../src/app/shared/ui/sidebar/sidebar.config.ts';


function printTree() {
  let output = '';

  for (const [key, profile] of Object.entries(PROFILES)) {
    output += `### ${profile.name} (Key: ${key})\n`;
    output += '```\n';
    output += `[ENCABEZADO]\n`;
    output += `MisVales\n`;
    output += `├── Rol: ${profile.name}\n`;
    output += `└── Alcance: ${profile.workspaceName}\n\n`;

    for (const group of profile.navGroups) {
      output += `[${group.heading}]\n`;
      
      for (let i = 0; i < group.items.length; i++) {
        const item = group.items[i];
        const isLastItem = i === group.items.length - 1;
        const prefix = isLastItem ? '└── ' : '├── ';
        
        output += `${prefix}${item.title}\n`;
        
        if (item.children) {
          for (let j = 0; j < item.children.length; j++) {
            const child = item.children[j];
            const isLastChild = j === item.children.length - 1;
            const childPrefix = isLastItem ? '    ' : '│   ';
            const childBullet = isLastChild ? '└── ' : '├── ';
            
            output += `${childPrefix}${childBullet}${child.title}\n`;
            
            if (child.children) {
              for (let k = 0; k < child.children.length; k++) {
                const subChild = child.children[k];
                const isLastSubChild = k === child.children.length - 1;
                const subChildPrefix = childPrefix + (isLastChild ? '    ' : '│   ');
                const subChildBullet = isLastSubChild ? '└── ' : '├── ';
                
                output += `${subChildPrefix}${subChildBullet}${subChild.title}\n`;
              }
            }
          }
        }
      }
      output += '\n';
    }
    
    output += `[INFERIOR FIJO]\n`;
    for (let i = 0; i < profile.bottomItems.length; i++) {
      const item = profile.bottomItems[i];
      const isLastItem = i === profile.bottomItems.length - 1;
      const prefix = isLastItem ? '└── ' : '├── ';
      output += `${prefix}${item.title}\n`;
      
      if (item.children) {
        for (let j = 0; j < item.children.length; j++) {
          const child = item.children[j];
          const isLastChild = j === item.children.length - 1;
          const childPrefix = isLastItem ? '    ' : '│   ';
          const childBullet = isLastChild ? '└── ' : '├── ';
          
          output += `${childPrefix}${childBullet}${child.title}\n`;
          
          if (child.children) {
              for (let k = 0; k < child.children.length; k++) {
                const subChild = child.children[k];
                const isLastSubChild = k === child.children.length - 1;
                const subChildPrefix = childPrefix + (isLastChild ? '    ' : '│   ');
                const subChildBullet = isLastSubChild ? '└── ' : '├── ';
                
                output += `${subChildPrefix}${subChildBullet}${subChild.title}\n`;
              }
            }
        }
      }
    }
    output += '```\n\n';
  }

  console.log(output);
}

printTree();
