#!/bin/bash
set -e

# Add empty line to every chapter
find chapters -name "*.md" | while read f; do tail -n1 $f | read -r _ || echo >> $f; done

MARKDOWN_OPTIONS=markdown+line_blocks+escaped_line_breaks+smart+fenced_code_blocks+fenced_code_attributes+backtick_code_blocks+yaml_metadata_block+footnotes+inline_notes+emoji

if [[ -z "${BUILD_ALL}" ]]; then
  FORMATS=(pdf)
else
  FORMATS=(pdf epub mobi)
fi

. ~/env/bin/activate

for format in ${FORMATS[*]}
do
  echo 👉 Building $format"…"

  ALL_ARGS=(
    -f $MARKDOWN_OPTIONS 
    -F pandoc-secnos 
    -F pandoc-filter.py 
    --pdf-engine=xelatex 
    --standalone 
    --toc
    --toc-depth=2
    --highlight-style=kate
  )
  
  if [[ "$format" == "mobi" ]]; then
    ebook-convert out/ebook_title-author_name.epub out/ebook_title-author_name.mobi --isbn 9788395736315
    # kindlegen out/ebook_title-author_name.epub
  else
    if [[ "$format" == "pdf" ]] || [[ "$format" == "latex" ]]; then
      ALL_ARGS+=(
        --include-in-header=header.latex
        chapters/000-metadata-pdf.yaml
      )
    elif [[ "$format" == "epub" ]]; then
      ALL_ARGS+=(
        --epub-metadata=epub-metadata.xml
        --epub-cover-image=chapters/pictures/cover.jpg
        --css=epub.css
        --epub-embed-font=epub-fonts/Merriweather-Bold.otf
        --epub-embed-font=epub-fonts/Merriweather-Regular.otf
        --epub-embed-font=epub-fonts/Merriweather-Italic.otf
        --epub-embed-font=epub-fonts/Merriweather-BoldItalic.otf
        --epub-embed-font=epub-fonts/FiraMono-Regular.otf
        --epub-embed-font=epub-fonts/FiraMono-Medium.otf
        epub-imprint.md
        chapters/000-metadata-epub.yaml
        --number-sections
      )
    else
      ALL_ARGS+=(
        chapters/000-metadata-pdf.yaml
      )
    fi

    ALL_ARGS+=(
      chapters/000-metadata-common.yaml 
      chapters/*.md
    )

    pandoc "${ALL_ARGS[@]}" -o out/ebook_title-author_name.$format
  fi

  if [[ "$format" == "epub" ]]; then
    cd add-headers
    npm install --production
    node fix-epub-css.js
    cd ..
  fi

  echo "😎 "$format" done"!
done

echo "All done! 🍾"
