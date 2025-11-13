#! /bin/bash

json=$(< package.json)
deps=$(echo $json | jq -r '.dependencies * .devDependencies | to_entries[] | "\(.key)@\(.value)"')

for dep in $deps; do
    name=$(echo $dep | cut -d'@' -f1)
    version=$(echo $dep | cut -d'@' -f2-)
    
    allInstalled=$(cat yarn.lock | grep -A1 "^$name@" | grep version | awk '{print $2}' | sed 's/"//g' | while read installed; do
        if [ "$installed" != "$version" ] && [ "^$installed" != "$version" ]; then
            echo "$installed"
        fi
    done | tr '\n' ' ')

    cat yarn.lock | grep -A1 "^$dep:" | grep version | awk '{print $2}' | sed 's/"//g' | while read installed; do
        if [ "$installed" != "$version"  ] && [ "^$installed" != "$version" ]; then
            echo "$name:"
            echo "specified=$version installed=$installed"
            if [[ "$allInstalled" =~ [[:space:]][^[:space:]] ]]; then
                echo "(all installed versions: $allInstalled)"
            fi
            echo
        fi
    done

    allInstalled=""
done
