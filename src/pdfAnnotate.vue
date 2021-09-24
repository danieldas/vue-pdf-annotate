<template>
  <div>
    <div>
      <iframe
        :src="src" id="myFrame"
        frameborder="0" style="border:0;"
        width="0" height="0">
      </iframe>
    </div>
  <div class="main" >
    <div class="toolbar" v-if="toolbar">
      <button style="font-size: 120%" class="cursor" type="button" title="Cursor" data-tooltype="cursor">➚</button>
      <button class="eraser" type="button" title="Borrador" data-tooltype="eraser">⌫</button>

      <div class="spacer"></div>

      <button class="rectangle" type="button" title="Rectángulo" data-tooltype="area">&nbsp;</button>
      <button class="circle" type="button" title="Círculo" data-tooltype="circle">○</button>
      <button class="circle" type="button" title="Círculo lleno" data-tooltype="fillcircle">◉</button>
      <button class="circle" type="button" title="Círculo vacío" data-tooltype="emptycircle">⦿</button>
<!--      <button class="arrow" type="arrow" title="Flecha" data-tooltype="arrow">➤</button>-->
      <div class="hotspot-color"></div>

      <button class="highlight" type="button" title="Fondo" data-tooltype="highlight">&nbsp;</button>
      <button class="strikeout" type="button" title="Tachado" data-tooltype="strikeout">&nbsp;</button>

      <div class="spacer"></div>

      <button class="text" type="button" title="Texto" data-tooltype="text"></button>
      <select class="text-size" style="font-family: 'Roboto'"></select>
      <div class="text-color"></div>

      <div class="spacer"></div>

      <button class="pen" type="button" title="Lápiz" data-tooltype="draw">✎</button>
      <select class="pen-size" style="font-family: 'Roboto'"></select>
      <div class="pen-color"></div>

      <div class="spacer"></div>

      <button  class="comment" type="button" title="Comentario" data-tooltype="point" style=" font-size: 120%">🗨</button>

      <div class="spacer"></div>

      <select class="scale" style="font-family: 'Roboto'">
        <option value=".5">50%</option>
        <option value="1">100%</option>
        <option value="1.0">100%</option>
        <option value="1.5">150%</option>
        <option value="2">200%</option>
      </select>

      <a href="javascript://" class="rotate-ccw" title="Rotar a la izquierda">⟲</a>
      <a href="javascript://" class="rotate-cw" title="Rotar a la derecha">⟳</a>

      <div class="spacer"></div>

      <a style="font-size: 130%" href="javascript://" class="clear" title="Borrar anotaciones">🗑 </a>
      <input type="checkbox" id="cbox2" value="ver" v-model="ver" @change="verComentarios"><label for="cbox2" style="font-size: 15px; font-family: 'Segoe UI'">Comentarios </label>
      <button style="font-size: 130%"  @click="listarComentarios" id="listarComentarios" class="listComments" type="button" title="Listar Comentarios" data-tooltype="cursor"> &#x2261; </button>
      <div class="spacer"></div>
      <button style="font-size: 130%;" @click="imprimir" type="button" title="Imprimir" >🖶</button>

<!--      <button class="btn" id="prev-page" @click="aumentarPagina">-->
<!--        &#xAB;-->
<!--      </button>-->
<!--      <button class="btn" id="next-page" @click="aumentarPagina">-->
<!--        &#xBB;-->
<!--      </button>-->
<!--      <input type="number" value="1" id="current_page">-->
<!--      <span class="page-info">-->
<!--            Page <span id="page-num"></span> of <span id="page-count"></span>-->
<!--        </span>-->
    </div>
    <div id="content-wrapper" style="margin-top: 14px; background-color: #757575">
      <div id="viewer" class="pdfViewer" ></div>
    </div>

    <div v-if="commentWrapper" id="comment-wrapper" style="margin-top: 16px">
      <h3 style="font-family: 'Roboto Black'" >Comentarios</h3>
      <div class="comment-list">
        <div class="comment-list-container">
          <div class="comment-list-item">No existen comentarios</div>
        </div>
        <form class="comment-list-form" style="display:none;">
          <input type="text" placeholder="Agregar comentario"/>
        </form>
      </div>
    </div>

  </div>

  </div>
</template>

<script>

import 'pdfjs-dist/web/pdf_viewer.css';
import pdfjsLib from 'pdfjs-dist/webpack.js';
import {PDFLinkService, PDFPageView, PDFFindController, DefaultAnnotationLayerFactory, DefaultTextLayerFactory } from 'pdfjs-dist/web/pdf_viewer.js';

// PDFJSAnnotate
import PDFJSAnnotate from './PDFJSAnnotate';
const { UI } = PDFJSAnnotate;
PDFJSAnnotate.setStoreAdapter(new PDFJSAnnotate.LocalStoreAdapter());

// initColorPicker
import initColorPicker from './initColorPicker'

const documentId = './static/output.pdf';

export default {
  name: 'pdfAnnotateVue',
  data(){
    return{
      ver:true,
      viewer: null,
      PAGE_HEIGHT: 1,
      NUM_PAGES: 0,
      renderedPages: [],
      okToRender: false,
      RENDER_OPTIONS:{
        documentId: this.src,
        pdfDocument: null,
        scale: parseFloat(localStorage.getItem(`${documentId}/scale`), 10) || 1.0,
        rotate: parseInt(localStorage.getItem(`${documentId}/rotate`), 10) || 0,
        pageNum:1,
        seeComments: true,
      }
    }
  },
  props: {
    src: {
      type: [String],
      default: '',
    },
    toolbar: {
      type: Boolean,
      default: false
    },
    commentWrapper: {
      type: Boolean,
      default: false
    },
    page: {
      type: Number,
      default: 1,
    },
    rotate: {
      type: Number,
      default: 0,
    },
    scale: {
      type: [Number, String],
      default: 1,
    },
    resize: {
      type: Boolean,
      default: false,
    },

  },
  watch: {
    src: function(val) {
      this.RENDER_OPTIONS.documentId = val
      this.render()
    },
    page: function(val) {
      // var self = this;
      // this.pdf.getPage(val).then(function (pdfPage) {
      //   self.pdfViewer.setPdfPage(pdfPage);
      //   self.pdfViewer.draw();
      // });
    },
    scale: function(val) {
      // this.drawScaled(val);
    },
    rotate: function(newRotate) {
      // if (this.pdfViewer) {
      //   this.pdfViewer.update(this.scale,newRotate);
      //   this.pdfViewer.draw();
      // }
    },
  },
  mounted(){
    const self = this
    document.getElementById('content-wrapper').addEventListener('scroll', (e) => {
      // console.log('scroll...')
      let visiblePageNum = Math.round(e.target.scrollTop / self.PAGE_HEIGHT) + 1;
      let visiblePage = document.querySelector(`.page[data-page-number="${visiblePageNum}"][data-loaded="false"]`);

      if (self.renderedPages.indexOf(visiblePageNum) === -1) {
        self.okToRender = true;
        self.renderedPages.push(visiblePageNum);
      }
      else {
        self.okToRender = false;
      }

      if (visiblePage && self.okToRender) {
        setTimeout(() => {
          UI.renderPage(visiblePageNum, self.RENDER_OPTIONS);
        });
      }
    });
    this.render()

    if(this.toolbar){
      this.HotspotColorStuff()
      this.TextStuff()
      this.PenStuff()
      this.ToolbarButtons()
      this.ScaleAndRotate()
      this.ClearToolbarButton()
    }

    if(this.commentWrapper){
      this.CommentStuff()
    }
    // this.listarComentarios();
  },
  methods: {
    async verComentarios(){
      if (this.RENDER_OPTIONS.seeComments !== this.ver) {
        this.RENDER_OPTIONS.seeComments = await this.ver;
        await localStorage.setItem(this.RENDER_OPTIONS.documentId + '/seecomments', this.RENDER_OPTIONS.seeComments);
        await this.render();
      }
    },
    imprimir(){
      let objFra = document.getElementById('myFrame');
      objFra.contentWindow.focus();
      objFra.contentWindow.print();
    },

    aumentarPagina(){


      // this.$emit("aumentarPagina");
      // this.RENDER_OPTIONS.page=this.RENDER_OPTIONS.pageNum +1
      // console.log('pagina ', this.RENDER_OPTIONS.pageNum)
    },
    listarComentarios(){

      var annotations = JSON.parse(localStorage.getItem(this.RENDER_OPTIONS.documentId + '/annotations')) || [];
      var commentList = document.querySelector('#comment-wrapper .comment-list-container');


      function groupComments(comments) {
        comments.sort(sortByProperty("page"));

        var result = [];
       comments.map(function (item) {

          if (item.type) {
            var pibote = item;
            if (item.type!=='textbox')
            pibote.content = '';
            comments.map(function (itemComent) {
              if (itemComent.annotation && itemComent.class == 'Comment' && itemComent.annotation == pibote.uuid) {
                pibote.content = pibote.content + ' ' + itemComent.content;
              }
            });
            result.push(pibote);
          }
        });
       // console.log('result ', result);
        return result;
      }
      function sortByProperty(property){


        return function(a,b){
          if(parseFloat(a[property]+100)+"" > parseFloat(b[property]+100)+""){
            return 1;
          }
          else if(parseFloat(a[property]+100)+"" < parseFloat(b[property]+100)+"")
            return -1;

          return 0;
        }
      }
      function goToPage(x, y, pageNumber) {
        // e?
      //  console.log('sata', x, y, pageNumber);
      //   if (pageNumber && pageNumber > 0) {
      //     // render2(pageNumber, x, y);
      //     showPage(pageNumber);
      //   }
      }

      function insertCommentWithLink(comment) {
        var child = document.createElement('div');
        child.setAttribute('style', 'font-family:Roboto; margin: 8px')
        child.className = 'comment-list-item';
        // child.innerHTML = twitter.autoLink(twitter.htmlEscape(comment.content || ''));
        // child.addEventListener('click', function() { goToPage(comment.x || '0', comment.y || '0', comment.page || '0') }); //        //saltar);

        var createA = document.createElement('a');
        var linea=  document.createElement('hr');
        var label=  document.createElement('label');

        var createAText = document.createTextNode('(Pag '+ comment.page+'). '+ comment.content );
        createA.setAttribute('href', "#pageContainer" + comment.page);
        createA.setAttribute('style', 'text-decoration:none; color:black;')
        linea.setAttribute('style', 'border-top: 1px solid rgba(0, 0, 0, 0.1)')

        linea.appendChild(createAText);
        child.appendChild(linea);
        createA.appendChild(createAText);
        child.appendChild(createA);
        commentList.appendChild(child);
      }

      var sortedComments = groupComments(annotations);

      // annotations.sort(function(a, b){
      //   return a.page - b.page;
      // });

      var nested = document.querySelector(".comment-list-container");
      nested.innerHTML = '';
      sortedComments.map(function (elem) {
        // annotations.map(elem => {
        // console.log('elem ', elem);
        if(elem.content!=='')
          return insertCommentWithLink(elem);
      });
      //console.log('annotations del localstorage ', annotations);
    },
    render(){
      const self = this
      self.viewer = document.getElementById('viewer');
      pdfjsLib.getDocument(this.RENDER_OPTIONS.documentId).then((pdf) => {
        self.RENDER_OPTIONS.pdfDocument = pdf;


        self.viewer.innerHTML = '';
        self.NUM_PAGES = pdf.numPages;
        for (let i = 0; i < self.NUM_PAGES; i++) {
          let page = UI.createPage(i + 1);
          self.viewer.appendChild(page);
        }

        UI.renderPage(1, self.RENDER_OPTIONS).then(([pdfPage, annotations]) => {
          let viewport = pdfPage.getViewport(self.RENDER_OPTIONS.scale, self.RENDER_OPTIONS.rotate);
          self.PAGE_HEIGHT = viewport.height;
        });
      });
    },
    // Hotspot color stuff
    HotspotColorStuff() {
      const self = this
      let hotspotColor = localStorage.getItem(`${self.RENDER_OPTIONS.documentId}/hotspot/color`) || 'darkgoldenrod';
      let currentTarget;

      function handleAnnotationClick(target) {
        let type = target.getAttribute('data-pdf-annotate-type');
        if (['fillcircle', 'arrow'].indexOf(type) === -1) {
          return; // nothing to do
        }
        currentTarget = target;
        hotspotColor = currentTarget.getAttribute('stroke');

        UI.setArrow(10, hotspotColor);
        UI.setCircle(10, hotspotColor);

        let a = document.querySelector('.hotspot-color .color');
        if (a) {
          a.setAttribute('data-color', hotspotColor);
          a.style.background = hotspotColor;
        }
      }

      function handleAnnotationBlur(target) {
        if (currentTarget === target) {
          currentTarget = undefined;
        }
      }

      initColorPicker(document.querySelector('.hotspot-color'), hotspotColor, function(value) {
        if (value === hotspotColor) {
          return; // nothing to do
        }
        localStorage.setItem(`${self.RENDER_OPTIONS.documentId}/hotspot/color`, value);
        hotspotColor = value;

        UI.setArrow(10, hotspotColor);
        UI.setCircle(10, hotspotColor);

        if (!currentTarget) {
          return; // nothing to do
        }

        let type = currentTarget.getAttribute('data-pdf-annotate-type');
        let annotationId = currentTarget.getAttribute('data-pdf-annotate-id');
        if (['fillcircle', 'arrow'].indexOf(type) === -1) {
          return; // nothing to do
        }

        // update target
        currentTarget.setAttribute('stroke', hotspotColor);
        currentTarget.setAttribute('fill', hotspotColor);

        // update annotation
        PDFJSAnnotate.getStoreAdapter().getAnnotation(documentId, annotationId).then((annotation) => {
          annotation.color = hotspotColor;
          PDFJSAnnotate.getStoreAdapter().editAnnotation(documentId, annotationId, annotation);
        });
      });

      UI.addEventListener('annotation:click', handleAnnotationClick);
      UI.addEventListener('annotation:blur', handleAnnotationBlur);

    },

    // Text stuff
    TextStuff() {
      const self = this
      let textSize;
      let textColor;

      function initText() {
        let size = document.querySelector('.toolbar .text-size');
        [8, 9, 10, 11, 12, 14, 18, 24, 30, 36, 48, 60, 72, 96].forEach((s) => {
          size.appendChild(new Option(s, s));
        });

        setText(
          localStorage.getItem(`${self.RENDER_OPTIONS.documentId}/text/size`) || 10,
          localStorage.getItem(`${self.RENDER_OPTIONS.documentId}/text/color`) || '#000000'
        );

        initColorPicker(document.querySelector('.text-color'), textColor, function(value) {
          setText(textSize, value);
        });
      }

      function setText(size, color) {
        let modified = false;

        if (textSize !== size) {
          modified = true;
          textSize = size;
          localStorage.setItem(`${self.RENDER_OPTIONS.documentId}/text/size`, textSize);
          document.querySelector('.toolbar .text-size').value = textSize;
        }

        if (textColor !== color) {
          modified = true;
          textColor = color;
          localStorage.setItem(`${self.RENDER_OPTIONS.documentId}/text/color`, textColor);

          let selected = document.querySelector('.toolbar .text-color.color-selected');
          if (selected) {
            selected.classList.remove('color-selected');
            selected.removeAttribute('aria-selected');
          }

          selected = document.querySelector(`.toolbar .text-color[data-color="${color}"]`);
          if (selected) {
            selected.classList.add('color-selected');
            selected.setAttribute('aria-selected', true);
          }
        }

        if (modified) {
          UI.setText(textSize, textColor);
        }
      }

      function handleTextSizeChange(e) {
        setText(e.target.value, textColor);
      }

      document.querySelector('.toolbar .text-size').addEventListener('change', handleTextSizeChange);

      initText();

    },
    // Pen stuff
    PenStuff(){
      const self = this
      let penSize;
      let penColor;

      function initPen() {
        let size = document.querySelector('.toolbar .pen-size');
        for (let i = 0; i < 20; i++) {
          size.appendChild(new Option(i + 1, i + 1));
        }

        setPen(
          localStorage.getItem(`${self.RENDER_OPTIONS.documentId}/pen/size`) || 1,
          localStorage.getItem(`${self.RENDER_OPTIONS.documentId}/pen/color`) || '#000000'
        );

        initColorPicker(document.querySelector('.pen-color'), penColor, function(value) {
          setPen(penSize, value);
        });
      }

      function setPen(size, color) {
        let modified = false;

        if (penSize !== size) {
          modified = true;
          penSize = size;
          localStorage.setItem(`${self.RENDER_OPTIONS.documentId}/pen/size`, penSize);
          document.querySelector('.toolbar .pen-size').value = penSize;
        }

        if (penColor !== color) {
          modified = true;
          penColor = color;
          localStorage.setItem(`${self.RENDER_OPTIONS.documentId}/pen/color`, penColor);

          let selected = document.querySelector('.toolbar .pen-color.color-selected');
          if (selected) {
            selected.classList.remove('color-selected');
            selected.removeAttribute('aria-selected');
          }

          selected = document.querySelector(`.toolbar .pen-color[data-color="${color}"]`);
          if (selected) {
            selected.classList.add('color-selected');
            selected.setAttribute('aria-selected', true);
          }
        }

        if (modified) {
          UI.setPen(penSize, penColor);
        }
      }

      function handlePenSizeChange(e) {
        setPen(e.target.value, penColor);
      }

      document.querySelector('.toolbar .pen-size').addEventListener('change', handlePenSizeChange);

      initPen();

    },
    // Toolbar buttons
    ToolbarButtons() {
      const self = this
      let tooltype = localStorage.getItem(`${self.RENDER_OPTIONS.documentId}/tooltype`) || 'cursor';
      if (tooltype) {
        setActiveToolbarItem(tooltype, document.querySelector(`.toolbar button[data-tooltype=${tooltype}]`));
      }

      function setActiveToolbarItem(type, button) {
        let active = document.querySelector('.toolbar button.active');
        if (active) {
          active.classList.remove('active');

          switch (tooltype) {
            case 'cursor':
              UI.disableEdit();
              break;
            case 'eraser':
              UI.disableEraser();
              break;
            case 'draw':
              UI.disablePen();
              break;
            case 'arrow':
              UI.disableArrow();
              break;
            case 'text':
              UI.disableText();
              break;
            case 'point':
              UI.disablePoint();
              break;
            case 'area':
            case 'highlight':
            case 'strikeout':
              UI.disableRect();
              break;
            case 'circle':
            case 'emptycircle':
            case 'fillcircle':
              UI.disableCircle();
              break;
          }
        }

        if (button) {
          button.classList.add('active');
        }
        if (tooltype !== type) {
          localStorage.setItem(`${self.RENDER_OPTIONS.documentId}/tooltype`, type);
        }
        tooltype = type;

        switch (type) {
          case 'cursor':
            UI.enableEdit();
            break;
          case 'eraser':
            UI.enableEraser();
            break;
          case 'draw':
            UI.enablePen();
            break;
          case 'arrow':
            UI.enableArrow();
            break;
          case 'text':
            UI.enableText();
            break;
          case 'point':
            UI.enablePoint();
            break;
          case 'area':
          case 'highlight':
          case 'strikeout':
            UI.enableRect(type);
            break;
          case 'circle':
          case 'emptycircle':
          case 'fillcircle':
            UI.enableCircle(type);
            break;
        }
      }

      function handleToolbarClick(e) {
        if (e.target.nodeName === 'BUTTON') {
          setActiveToolbarItem(e.target.getAttribute('data-tooltype'), e.target);
        }
      }

      document.querySelector('.toolbar').addEventListener('click', handleToolbarClick);

    },
    // Scale/rotate
    ScaleAndRotate() {
      const self = this
      function setScaleRotate(scale, rotate) {
        scale = parseFloat(scale, 10);
        rotate = parseInt(rotate, 10);

        if (self.RENDER_OPTIONS.scale !== scale || self.RENDER_OPTIONS.rotate !== rotate) {
          self.RENDER_OPTIONS.scale = scale;
          self.RENDER_OPTIONS.rotate = rotate;

          localStorage.setItem(`${self.RENDER_OPTIONS.documentId}/scale`, self.RENDER_OPTIONS.scale);
          localStorage.setItem(`${self.RENDER_OPTIONS.documentId}/rotate`, self.RENDER_OPTIONS.rotate % 360);

          self.render();
        }
      }

      function handleScaleChange(e) {
        setScaleRotate(e.target.value, self.RENDER_OPTIONS.rotate);
      }

      function handleRotateCWClick() {
        setScaleRotate(self.RENDER_OPTIONS.scale, self.RENDER_OPTIONS.rotate + 90);
      }

      function handleRotateCCWClick() {
        setScaleRotate(self.RENDER_OPTIONS.scale, self.RENDER_OPTIONS.rotate - 90);
      }

      document.querySelector('.toolbar select.scale').value = self.RENDER_OPTIONS.scale;
      document.querySelector('.toolbar select.scale').addEventListener('change', handleScaleChange);
      document.querySelector('.toolbar .rotate-ccw').addEventListener('click', handleRotateCCWClick);
      document.querySelector('.toolbar .rotate-cw').addEventListener('click', handleRotateCWClick);

    },

    // Clear toolbar button
     ClearToolbarButton() {
      const self = this
      function handleClearClick(e) {
        if (confirm('¿Está seguro de borrar todas las anotaciones?')) {
          for (let i = 0; i < self.NUM_PAGES; i++) {
            document.querySelector(`div#pageContainer${i + 1} svg.annotationLayer`).innerHTML = '';
          }

          localStorage.removeItem(`${self.RENDER_OPTIONS.documentId}/annotations`);
         self.listarComentarios();

        }

      }

      document.querySelector('a.clear').addEventListener('click', handleClearClick);
    },
    // Comment stuff
    CommentStuff(){
      const self = this
      let commentList = document.querySelector('#comment-wrapper .comment-list-container');
      let commentForm = document.querySelector('#comment-wrapper .comment-list-form');
      let commentText = commentForm.querySelector('input[type="text"]');

      function supportsComments(target) {
        let type = target.getAttribute('data-pdf-annotate-type');
        return ['point', 'highlight', 'area'].indexOf(type) > -1;
      }

      function insertComment(comment) {
        let child = document.createElement('div');
        child.className = 'comment-list-item';
        // child.innerHTML = twitter.autoLink(twitter.htmlEscape(comment.content));

        commentList.appendChild(child);
      }

      function handleAnnotationClick(target) {
        if (supportsComments(target)) {
          let documentId = target.parentNode.getAttribute('data-pdf-annotate-document');
          let annotationId = target.getAttribute('data-pdf-annotate-id');

          PDFJSAnnotate.getStoreAdapter().getComments(documentId, annotationId).then((comments) => {
            commentList.innerHTML = '';
            commentForm.style.display = '';
            commentText.focus();

            commentForm.onsubmit = function() {
              PDFJSAnnotate.getStoreAdapter().addComment(documentId, annotationId, commentText.value.trim())
                .then(insertComment)
                .then(() => {
                  commentText.value = '';
                  commentText.focus();
                });

              return false;
            };

            comments.forEach(insertComment);
          });
        }
      }

      function handleAnnotationBlur(target) {
        if (supportsComments(target)) {
          commentList.innerHTML = '';
          commentForm.style.display = 'none';
          commentForm.onsubmit = null;

          insertComment({content: 'No comments'});
        }
      }

      UI.addEventListener('annotation:click', handleAnnotationClick);
      UI.addEventListener('annotation:blur', handleAnnotationBlur);

      UI.setArrow(10, 'darkgoldenrod');
      UI.setCircle(10, 'darkgoldenrod');
      this.listarComentarios();

    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  body {
    background-color: #eee;
    font-family: sans-serif;
    margin: 0;
  }

  .pdfViewer .canvasWrapper {
    box-shadow: 0 0 3px #bbb;
  }
  .pdfViewer .page {
    margin-bottom: 10px;
  }

 
  #content-wrapper {
    position: absolute;
    top: 35px;
    left: 0;
    right: 250px;
    bottom: 0;
    overflow: auto;
  }

  #comment-wrapper {
    position: absolute;
    top: 35px;
    right: 0;
    bottom: 0;
    overflow: auto;
    width: 250px;
    background: #F7F7F7;
    border-left: 1px solid #d0d0d0;
  }
  #comment-wrapper h4 {
    margin: 10px;
  }
  #comment-wrapper .comment-list {
    font-size: 12px;
    position: absolute;
    top: 38px;
    left: 0;
    right: 0;
    bottom: 0;
  }
  #comment-wrapper .comment-list-item {
    border-bottom: 1px solid #d0d0d0;
    padding: 10px;
  }
  #comment-wrapper .comment-list-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 47px;
    overflow: auto;
  }
  #comment-wrapper .comment-list-form {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 10px;
  }
  #comment-wrapper .comment-list-form input {
    padding: 5px;
    width: 100%;
  }

  
</style>
