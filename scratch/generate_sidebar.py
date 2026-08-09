import re
import json

def generate_ts():
    with open('roles_raw.txt', 'r', encoding='utf-8') as f:
        content = f.read()

    roles = content.split('---')
    
    out = """export interface NavItemData {
  id: string;
  title: string;
  icon: string;
  route?: string;
  badge?: number | string;
  shortcut?: string;
  children?: NavItemData[];
  permissions?: string[]; // Para filtrar por permisos efectivos
}

export interface NavGroupData {
  heading?: string;
  items: NavItemData[];
}

export interface Profile {
  id: string;
  name: string;
  workspaceName: string;
  navGroups: NavGroupData[];
  bottomItems: NavItemData[];
}

export const PROFILES: Record<string, Profile> = {
"""
    
    role_mapping = {
        'GERENTE GENERAL': 'gerente_general',
        'GERENTE DE SUCURSAL': 'gerente_sucursal',
        'COORDINADOR': 'coordinador',
        'VERIFICADOR': 'verificador',
        'ADMINISTRADOR': 'administrador',
        'DISTRIBUIDORA': 'distribuidora',
        'CAJERA': 'cajera'
    }

    id_counter = 1

    for r_idx, role_text in enumerate(roles):
        lines = [line for line in role_text.splitlines() if line.strip()]
        if not lines: continue
        
        role_display = lines[0].strip()
        role_id = role_mapping.get(role_display, 'unknown')
        if role_display == 'ADMINISTRADOR — SOLO LECTURA':
            role_id = 'administrador'
            role_display = 'Administrador'
        
        # parse header
        workspace = "Alcance: Global"
        for line in lines:
            if "Alcance:" in line:
                workspace = line.split("Alcance:")[1].strip()
                break
            if "Sucursal asignada" in line:
                workspace = "Sucursal asignada"
                break
        
        out += f"  {role_id}: {{\n"
        out += f"    id: '{role_id}',\n"
        out += f"    name: '{role_display.title()}',\n"
        out += f"    workspaceName: '{workspace}',\n"
        out += f"    navGroups: [\n"
        
        groups = []
        current_group = None
        current_level1 = None
        current_level2 = None
        current_section = None
        
        i = 0
        while i < len(lines):
            line = lines[i]
            # Match groups like [GENERAL]
            g_match = re.match(r'^\[([A-Z\sÓÁÉÍÚ]+)\]', line)
            if g_match:
                section_name = g_match.group(1)
                if section_name not in ['ENCABEZADO', 'INFERIOR FIJO']:
                    current_section = section_name
                    groups.append({'heading': current_section, 'items': []})
                    current_level1 = None
                    current_level2 = None
            elif current_section and line.startswith('├── ') or line.startswith('└── '):
                # Level 1
                title = line[4:].strip().split(' [M')[0]
                item = {'id': f'item_{id_counter}', 'title': title, 'icon': 'hash', 'children': []}
                id_counter += 1
                
                # set standard icons
                if title.lower() == 'buscar' or title.lower() == 'buscar folio': item['icon'] = 'search'
                if title.lower() == 'inicio': item['icon'] = 'layout-dashboard'
                if title.lower() == 'bandeja': item['icon'] = 'inbox'
                if title.lower() == 'mi cuenta': item['icon'] = 'user'
                if title.lower() == 'cerrar sesión': item['icon'] = 'log-out'
                if 'distribuidoras' in title.lower(): item['icon'] = 'users'
                if 'organización' in title.lower(): item['icon'] = 'folder-kanban'
                if 'reportes' in title.lower(): item['icon'] = 'file-check'
                
                if groups:
                    groups[-1]['items'].append(item)
                current_level1 = item
                current_level2 = None
            elif current_section and (line.startswith('│   ├── ') or line.startswith('│   └── ') or line.startswith('    ├── ') or line.startswith('    └── ')):
                # Level 2
                title = line[8:].strip().split(' [M')[0] if len(line) > 8 else line.replace('│   ├── ', '').replace('│   └── ', '').replace('    ├── ', '').replace('    └── ', '').strip()
                item = {'id': f'item_{id_counter}', 'title': title, 'icon': 'hash', 'children': []}
                id_counter += 1
                if current_level1:
                    current_level1['children'].append(item)
                    current_level2 = item
            elif current_section and (line.startswith('│   │   ├── ') or line.startswith('│   │   └── ') or line.startswith('    │   ├── ') or line.startswith('    │   └── ')):
                # Level 3
                title = line[12:].strip().split(' [M')[0] if len(line) > 12 else line.replace('│   │   ├── ', '').replace('│   │   └── ', '').replace('    │   ├── ', '').replace('    │   └── ', '').strip()
                item = {'id': f'item_{id_counter}', 'title': title, 'icon': 'hash'}
                id_counter += 1
                if current_level2:
                    current_level2['children'].append(item)
            
            i += 1
            
        def dump_items(items, indent_level):
            res = ""
            ind = "  " * indent_level
            for it in items:
                res += f"{ind}{{\n"
                res += f"{ind}  id: '{it['id']}',\n"
                res += f"{ind}  title: '{it['title']}',\n"
                res += f"{ind}  icon: '{it['icon']}'"
                
                if it.get('children'):
                    res += f",\n{ind}  children: [\n"
                    res += dump_items(it['children'], indent_level + 2)
                    res += f"{ind}  ]\n"
                else:
                    res += "\n"
                res += f"{ind}}},\n"
            return res

        for g in groups:
            out += f"      {{\n"
            out += f"        heading: '{g['heading'].title()}',\n"
            out += f"        items: [\n"
            out += dump_items(g['items'], 5)
            out += f"        ]\n"
            out += f"      }},\n"
        out += f"    ],\n"
        
        # parse bottom items
        bottom_items = []
        i = 0
        in_bottom = False
        current_b_l1 = None
        while i < len(lines):
            line = lines[i]
            if line == '[INFERIOR FIJO]':
                in_bottom = True
            elif in_bottom and (line.startswith('├── ') or line.startswith('└── ')):
                title = line[4:].strip()
                item = {'id': f'item_{id_counter}', 'title': title, 'icon': 'hash', 'children': []}
                if title.lower() == 'mi cuenta': item['icon'] = 'user'
                if title.lower() == 'cerrar sesión': item['icon'] = 'log-out'
                id_counter += 1
                bottom_items.append(item)
                current_b_l1 = item
            elif in_bottom and (line.startswith('│   ├── ') or line.startswith('│   └── ') or line.startswith('    ├── ') or line.startswith('    └── ')):
                title = line[8:].strip() if len(line) > 8 else line.replace('│   ├── ', '').replace('│   └── ', '').replace('    ├── ', '').replace('    └── ', '').strip()
                item = {'id': f'item_{id_counter}', 'title': title, 'icon': 'hash', 'children': []}
                id_counter += 1
                if current_b_l1:
                    current_b_l1['children'].append(item)
                    current_b_l2 = item
            elif in_bottom and (line.startswith('│   │   ├── ') or line.startswith('│   │   └── ') or line.startswith('    │   ├── ') or line.startswith('    │   └── ')):
                title = line[12:].strip() if len(line) > 12 else line.replace('│   │   ├── ', '').replace('│   │   └── ', '').replace('    │   ├── ', '').replace('    │   └── ', '').strip()
                item = {'id': f'item_{id_counter}', 'title': title, 'icon': 'hash'}
                id_counter += 1
                if current_b_l2:
                    current_b_l2['children'].append(item)
            i += 1
            
        out += f"    bottomItems: [\n"
        out += dump_items(bottom_items, 3)
        out += f"    ]\n"
        out += f"  }},\n"

    out += "};\n"
    
    with open('../src/app/shared/ui/sidebar/sidebar.config.ts', 'w', encoding='utf-8') as f:
        f.write(out)

if __name__ == '__main__':
    generate_ts()
