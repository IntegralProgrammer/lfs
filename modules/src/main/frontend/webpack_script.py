import json
import sys
import os
import os.path
from os import path

def merge_packache_json_files(base_dir, project_to_name_map):
    package_merged = {}

    for name in os.listdir(base_dir):

        fl = os.path.join(base_dir, name, 'src', 'main', 'frontend', 'package.json')
        if path.exists(fl):

            f = open(fl, "r")
            json_text = f.read()
            package = json.loads(json_text)
            project_to_name_map[name] = package["name"]

            if package_merged == {}:
                package_merged = package
                package_merged["name"] = 'lfs-modules'
                package_merged["description"] = 'Merged package.json'
                package_merged["repository"]["directory"] = "modules"
                continue

            # Merge contents
            package_merged["devDependencies"].update(package["devDependencies"])
            package_merged["dependencies"].update(package["dependencies"])

    f = open("package.json", "w+")
    f.write(json.dumps(package_merged, indent=2, sort_keys=False))
    f.close()


def merge_webpack_files(base_dir, project_to_name_map):
    webpack_merged = os.path.join(base_dir, 'src', 'main', 'frontend', 'webpack.config.js')
    entries = []
    externals = []

    for name in os.listdir(base_dir):

        fl = os.path.join(base_dir, name, 'src', 'main', 'frontend', 'webpack.config.js')
        if path.exists(fl):

            ins = open(fl, 'rt')
            lines = ins.readlines()
            
            entry_line_number = lines.index('  entry: {\n')
            for i in range(entry_line_number+1, len(lines)):

                if '}' in lines[i]:
                    break
                if lines[i].strip() == '{':
                    continue
                if not lines[i].endswith(',\n'):
                    lines[i] = lines[i].replace('\n', ',\n')
                if lines[i] in entries:
                    continue

                module_name = project_to_name_map[name] + "."
                path_to_source = os.path.join(base_dir, name, 'src', 'main', 'frontend').replace('\\','/')
                path_to_base_source = os.path.join(base_dir, 'src', 'main', 'frontend', 'node_modules').replace('\\','/')
                line = lines[i].replace('module_name + \'', '\'' + module_name).replace(']: \'./', ']: \''+path_to_source+'/').replace(']: \'@', ']: \''+path_to_base_source+'/@')
                entries.append(line)

            ext_line_number = lines.index('  externals: [\n')
            for i in range(ext_line_number+1, len(lines)):

                if '}' in lines[i]:
                    break
                if lines[i].strip() == '{':
                    continue
                if not lines[i].endswith(',\n'):
                    lines[i] = lines[i].replace('\n', ',\n')
                if lines[i] in externals:
                    continue

                externals.append(lines[i])

    # Remove last ',' in a last string
    entries[-1] = entries[-1].replace(',\n', '\n')
    externals[-1] = externals[-1].replace(',\n', '\n')

    f = open(webpack_merged, 'r')
    lines = f.readlines()
    entry_line_number = lines.index('ENTRY_CONTENT\n')
    lines[entry_line_number] = lines[entry_line_number].replace('ENTRY_CONTENT\n', '      ' + '      '.join(entries))
    ext_line_number = lines.index('EXTERNALS_CONTENT\n')
    lines[ext_line_number] = lines[ext_line_number].replace('EXTERNALS_CONTENT\n', '      ' + '      '.join(externals))
    f.close()

    f = open(webpack_merged, "w")
    for item in lines:
        f.write("%s" % item)
    f.close()


def main(args=sys.argv[1:]):
    base_dir = args[0]
    project_to_name_map = {}
    merge_packache_json_files(base_dir, project_to_name_map)
    merge_webpack_files(base_dir, project_to_name_map)

if __name__ == '__main__':
    main()