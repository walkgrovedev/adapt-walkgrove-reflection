define([
  'core/js/adapt',
  'core/js/views/componentView',
  'core/js/models/componentModel'//,
  //'core/js/models/fontModel'
], function(Adapt, ComponentView, ComponentModel) { //, FontModel

  var ReflectionView = ComponentView.extend({

    events: {
      'click .js-reflection-save-click': 'onSaveData',
      'click .js-reflection-export-click': 'onExportPDF'
    },

    _data: '',
    
    preRender: function() {

      this.checkIfResetOnRevisit();
    },

    postRender: function() {
      this.setReadyStatus();

      this.setupInview();

      let reflectionData = Adapt.offlineStorage.get('reflection_data');
      if (reflectionData !== 'undefined' && reflectionData !== null) {

        const reflects = reflectionData.split("*");
        for(let r=0; r<reflects.length-1; r++){
          const reflect = reflects[r].split("^");
          if (reflect[0] === this.model.get('_id')) {

            // one input ...?
            if(!this.model.get('_items')) {

              this.$('.reflection__item-textbox').val(reflect[4]);

            } else {

              this.model.get('_items').forEach(function(item, i) {
                if(i === Number(reflect[1])) {
                  this.$('.reflection__item-textbox').eq(i).val(reflect[4]);
                }
              });

            }
            
            if(this.model.get('exportText') != "") {
              this.$('.js-reflection-export-click').addClass('is-visible');
            }

          }
        }

      }

      if(this.model.get('saveText') === "") {
        this.$('.js-reflection-export-click').addClass('is-visible');
      }

    },

    setupInview: function() {
      var selector = this.getInviewElementSelector();
      if (!selector) {
        // this.setCompletionStatus();
        return;
      }

      this.setupInviewCompletion(selector);
    },

    onSaveData: function() {
      // save to scorm data
      let reflectionData = Adapt.offlineStorage.get('reflection_data');
      
      // one input ...?
      if(!this.model.get('_items')) {

        const questionText = this.model.get('question') ? this.model.get('question') : '';

        if (reflectionData === 'undefined' || reflectionData === null) {
          reflectionData = this.model.get('_id') + '^0^' + this.model.get('displayTitle') + '^' + questionText + '^' + this.$('.reflection__item-textbox').val() + '^ ^ *';
        } else {
          //check if already exists to overwrite - split string into array, check _id
          const reflects = reflectionData.split("*");
          let found = false;
          let newData = "";
          for(let r=0; r<reflects.length-1; r++){
            let reflect = reflects[r].split("^");
            if (reflect[0] === this.model.get('_id')) {
              found =  true;
              reflect[4] = this.$('.reflection__item-textbox').val();
            }
            newData += reflect[0].toString() + '^' + reflect[1].toString() + '^' + reflect[2].toString() + '^' + reflect[3].toString() + '^' + reflect[4].toString() + '^' + reflect[5].toString() + '^' + reflect[6].toString() + '*'
          }
          if (found) {
            reflectionData = newData;
          } else {
            reflectionData += this.model.get('_id') + '^0^' + this.model.get('displayTitle') + '^' + questionText + '^' + this.$('.reflection__item-textbox').val() + '^ ^ *';
          }
        }

      } else {

        
        
        if (reflectionData === 'undefined' || reflectionData === null) {
          reflectionData = '';
          this.model.get('_items').forEach((item, i) => {
            const questionText = item.question ? item.question : ' ';
            const titleText = item.title ? item.title : ' ';
            const subTitleText = item.subtitle ? item.subtitle : ' ';
            reflectionData += this.model.get('_id') + '^' + i + '^' + this.model.get('displayTitle') + '^' + questionText + '^' + this.$('.reflection__item-textbox').eq(i).val() + '^' + titleText + '^' + subTitleText + '*';
          });
        } else {
          //check if already exists to overwrite - split string into array, check _id
          const reflects = reflectionData.split("*");
          let found = false;
          let newData = "";
          for(let r=0; r<reflects.length-1; r++){
            let reflect = reflects[r].split("^");
            if (reflect[0] === this.model.get('_id')) {
              found =  true;
              this.model.get('_items').forEach(function(item, i) {
                if(i === Number(reflect[1])) {
                  reflect[4] = this.$('.reflection__item-textbox').eq(i).val();
                }
              });
            }
            newData += reflect[0].toString() + '^' + reflect[1].toString() + '^' + reflect[2].toString() + '^' + reflect[3].toString() + '^' + reflect[4].toString() + '^' + reflect[5].toString() + '^' + reflect[6].toString() + '*'
          }
          if (found) {
            reflectionData = newData;
          } else {
            this.model.get('_items').forEach((item, i) => {
              const questionText = item.question ? item.question : ' ';
              const titleText = item.title ? item.title : ' ';
              const subTitleText = item.subtitle ? item.subtitle : ' ';
              reflectionData += this.model.get('_id') + '^' + i + '^' + this.model.get('displayTitle') + '^' + questionText + '^' + this.$('.reflection__item-textbox').eq(i).val() + '^' + titleText + '^' + subTitleText + '*';
            });
          }

        }

      }

      //console.log(this._data);
      
      this._data = reflectionData;
      //save to scorm
      //Adapt.offlineStorage.set('reflection_data', reflectionData);
      Adapt.offlineStorage.set('r', reflectionData);
      
      // show as saved...
      this.$('.reflection__message').addClass('is-visible');
      // show export button - if required
      if(this.model.get('exportText') != "") {
        this.$('.js-reflection-export-click').addClass('is-visible');
      }

      // console.log(FontModel);

      this.setCompletionStatus();
    },

    onExportPDF: function() {

      if (this._data === '') {
        let reflectionData = Adapt.offlineStorage.get('reflection_data');
        this._data = reflectionData;
      }
      //alert(this._data);
      
      require(['https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.0.0/jspdf.umd.js'], ({ jsPDF }) => {
        const doc = new jsPDF();

        const pageHeight = doc.internal.pageSize.height;

        // doc.addFileToVFS("fonts/arial.ttf", getDefault());
        // doc.addFont("fonts/arial.ttf", "Arial", "normal");

        // doc.setFont("Arial");

        // switch (Adapt.offlineStorage.get('lang')) {
        //   case 'zh-s':
        //   doc.addFileToVFS('fonts/MicrosoftYaHei-01-normal.ttf', FontModel.getChinese());
        //   doc.addFont('fonts/MicrosoftYaHei-01-normal.ttf', 'MicrosoftYaHei-01', 'normal');
        //   doc.setFont("fonts/MicrosoftYaHei-01");
        //   break;
        //   case 'ar':
        //   doc.addFileToVFS('fonts/PTSans-normal.ttf', FontModel.getArabic());
        //   doc.addFont('fonts/PTSans-normal.ttf', 'PTSans', 'normal');
        //   doc.setFont("fonts/PTSans");
        //   // doc.text('مرحبا', this.pdfWidth, 10);
        //   break;
        //   case 'ru':
        //   doc.addFileToVFS('fonts/Amiri-Regular-normal.ttf', FontModel.getRussian());
        //   doc.addFont('fonts/Amiri-Regular-normal.ttf', 'Amiri-Regular', 'normal');
        //   doc.setFont("fonts/Amiri-Regular");
        //   //doc.text("А ну чики брики и в дамки!", 10, 10);
        //   break;
        // }

        const d = new Date();
        const dateToday = '' + d.getDate() + (d.getMonth() + 1) + d.getFullYear() + '';
      
        
        let yPos = 10;
        const leftPos = 10;
        const centerPos = 100;
        const maxWidth = 190;
        
        const pdfImage = this.$('.reflection__pdf-image').html();
        doc.addImage(pdfImage, 'png', leftPos, yPos, maxWidth, 90, '', 'none', 0);
        yPos += 105;
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        const pdfTitle = this.$('.reflection__pdf-title').html();
        doc.text(pdfTitle, centerPos, yPos, { align: 'center', maxWidth: maxWidth });
        yPos += 10;

        doc.setDrawColor(0);
        doc.setFillColor(0, 0, 153);
        doc.rect(leftPos, yPos, maxWidth, 1, "F");
        yPos += 15;

        let tempID = '';
        const reflects = this._data.split("*");
        for(let r=0; r<reflects.length-1; r++){
          const reflect = reflects[r].split("^");
            
          doc.setTextColor(0, 0, 153);
          doc.setFontSize(17);
          doc.setFont("helvetica", "bold");
          let textTitle = '' + reflect[2];
          const id = reflect[0];
          if (id !== tempID) {
            tempID = id;
            doc.text(textTitle, leftPos, yPos, { align: 'left', maxWidth: maxWidth });
            yPos += 10;
            yPos = this.checkNewPagePDF(doc, yPos, pageHeight);
          }

          doc.setTextColor(0, 0, 0);
          doc.setFontSize(13);
          let textInputTitles = '';
          if (reflect[5] !== ' ') { 
            textInputTitles += reflect[5]; 
            if (reflect[6] !== ' ') {
              textInputTitles += ' - ';
            }
          }
          if (reflect[6] !== ' ') { textInputTitles += reflect[6]; }
          if (textInputTitles !== '') {
            doc.text(textInputTitles, leftPos, yPos, { align: 'left', maxWidth: maxWidth });
            yPos += 15;
            yPos = this.checkNewPagePDF(doc, yPos, pageHeight);
          }
          

          doc.setTextColor(0, 0, 0);
          doc.setFont("helvetica", "normal");
          let textAction = '' + reflect[4];
          doc.text(textAction, leftPos, yPos, { align: 'left', maxWidth: maxWidth });
          yPos += 35;
          yPos = this.checkNewPagePDF(doc, yPos, pageHeight);
        }

        this.addFooter(doc);

        doc.save("reflection-" + dateToday + ".pdf");

      });

    },

    checkNewPagePDF: function(doc, yPos, pageHeight) {
      if (yPos >= pageHeight) {
          this.addFooter(doc);
          doc.addPage();
          yPos = 10; // Restart height position
      }
      return yPos;
    },

    addFooter: function(doc) {
      const d = new Date();
      const dateToShow = 'reflection ' + d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear() + '';
        
      const centerPos = 100;
      const maxWidth = 190;
      const bottomPos = 290;
        
      doc.setFont("helvetica", "italic");
      doc.text(dateToShow, centerPos, bottomPos, { align: 'center', maxWidth: maxWidth });
    },

    /**
     * determines which element should be used for inview logic - body, instruction or title - and returns the selector for that element
     */
    getInviewElementSelector: function() {
     return 'reflection__message';
    },

    checkIfResetOnRevisit: function() {
      var isResetOnRevisit = this.model.get('_isResetOnRevisit');

      // If reset is enabled set defaults
      if (isResetOnRevisit) {
        this.model.reset(isResetOnRevisit);
      }
    }




  },
  {
    template: 'reflection'
  });

  return Adapt.register('reflection', {
    model: ComponentModel.extend({}),// create a new class in the inheritance chain so it can be extended per component type if necessary later
    view: ReflectionView
  });
});
