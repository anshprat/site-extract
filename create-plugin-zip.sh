
set -xe
pluginname=$(basename $PWD)
basepath=~/tmp/$pluginname
today=$(date +%Y.%m%d.%H%M.%S|sed -E 's/\.0+/\./g')
# today=1.0.0
basefolder="$basepath/${today}"

srcfolder="$basefolder/$pluginname"
files="content.js icon128.png manifest.json background.js popup.html popup.js"

current_shell=$(ps -p $$ -o comm=)

# Get the script directory
if [ "$current_shell" = "zsh" ]; then
  # For Zsh
  script_dir=$(dirname "${(%):-%x}")
else
  # For Bash and other compatible shells
  script_dir=$(dirname "$(readlink -f "$0")")
fi

source $script_dir/config.sh

update_tmpl() {
    sed -e "s/APPVERSION/${today}/" \
    -e "s/BRWSR_TYPE/${BRWSR_TYPE}/g" \
    -e "s/OLD_SITE/${OLD_SITE}/g" \
    -e "s/NEW_SITE/${NEW_SITE}/g" \
    -e "s/TEXT_ANCHOR/${TEXT_ANCHOR}/g" \
    $script_dir/$SRC_FILE > $script_dir/$DEST_FILE
}



# For Chrome

mkdir -p $srcfolder
# Templates are named .tpl.js instead of .js.tpl to facilitate file type identification in IDE

build_chrome(){
SRC_FILE=content.tpl.js
DEST_FILE=content.js
BRWSR_TYPE=chrome
update_tmpl

SRC_FILE=manifest.chrome.tpl.json
DEST_FILE=manifest.json
update_tmpl

SRC_FILE=background.tpl.js
DEST_FILE=background.js
update_tmpl

cd $script_dir
echo $PWD
cp $files $srcfolder

zip -r ${srcfolder}-chrome.zip $files
build_files

}

build_firefox(){
# For Firefox
SRC_FILE=content.js.tpl
DEST_FILE=content.js
BRWSR_TYPE=browser
update_tmpl


SRC_FILE=manifest.json.firefox.tpl
DEST_FILE=manifest.json
BRWSR_TYPE=browser
update_tmpl

zip -r -FS ${srcfolder}-firefox.zip $files
build_files
}

build_files(){
rm -rf $basefolder/../latest
mkdir $basefolder/../latest
cp -rf $basefolder/* $basefolder/../latest
}

build_cmd=$1
custom_cmd=$2

case $build_cmd in
    "f")
        build_firefox
        ;;
    "c")
        build_chrome
        ;;
    *)
        build_chrome
        # build_firefox
        ;;
esac


case $custom_cmd in
    "o")
        open ${basefolder}/../latest
        ;;
    "c")
        code ${basefolder}/../latest
        ;;
    "oc"|"co")
            open ${basefolder}/../latest
            code ${basefolder}/../latest
        ;;
    *)
        ;;
esac
# open ${basefolder}/../latest
# code ${basefolder}/../latest
# rm content.js manifest.json background.js

# cleanup generated DEST_FILES
self_script=$(basename $0)
echo $PWD
rm -rvf $(cat $script_dir/$self_script|grep ^DEST_FILE|sort|uniq|awk -F '=' '{print $2}')
