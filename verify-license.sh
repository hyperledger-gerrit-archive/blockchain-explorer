#!/bin/bash

echo -e "\tChecking files with no license header ..."

explorer_files=$(git ls-files)
retval=0
GREP_MATCH=0  # Exit status of grep command:  0=Matched,  1=Unmatched
LICENSE_HEADER="SPDX-License-Identifier"

# If you want to exclude some paths, add a keyword with an extended regular expression format to excluded_paths
# excluded_paths="/e2e-test/ /test/"

for explorer_file in ${explorer_files}; do

  file -ib ${explorer_file} | grep -qE "^text/"
  if [[ $? -eq ${GREP_MATCH} ]]; then

    # Only files which mime-type is 'text/*'

    isExclude=0
    for excluded_path in ${excluded_paths}; do
      # Exclude specific files from checking
      echo ${explorer_file} | grep -qE "${excluded_path}"
      if [[ $? -eq ${GREP_MATCH} ]]; then
        # echo "EXCLUDED -- ${explorer_file}"
        isExclude=1
        break
      fi
    done
    if [[ ${isExclude} -eq 1 ]]; then continue; fi

    grep -q ${LICENSE_HEADER} ${explorer_file}
    if [[ $? -ne ${GREP_MATCH} ]]; then
      detected_files="${detected_files} ${explorer_file}"
      # If find at least 1 file that doesn't contain lincense header, return non-zero
      retval=1
    fi
  fi
done

if [[ ${retval} -ne 0 ]]; then
  echo -e "\tDetected files with no license header!"
  echo -e "\t--------------------------------------"
  for detected_file in ${detected_files}; do
    echo -e "\t${detected_file}"
  done
  echo -e "\t--------------------------------------"
fi

exit ${retval}