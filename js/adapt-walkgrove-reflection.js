define([
  'core/js/adapt',
  'core/js/views/componentView',
  'core/js/models/componentModel'
], function(Adapt, ComponentView, ComponentModel) {

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

        const reflects = reflectionData.split(",");
        for(let r=0; r<reflects.length-1; r++){
          const reflect = reflects[r].split(":");
          if (reflect[0] === this.model.get('_id')) {
            this.$('.reflection__item-textbox').val(reflect[2]);

            if(this.model.get('exportText') != "") {
              this.$('.js-reflection-export-click').addClass('is-visible');
            }
          }
        }

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
      if (reflectionData === 'undefined' || reflectionData === null) {
        reflectionData = this.model.get('_id') + ':' + this.model.get('displayTitle') + ':' + this.$('.reflection__item-textbox').val() + ',';
      } else {
        //check if already exists to overwrite - split string into array, check _id
        const reflects = reflectionData.split(",");
        let found = false;
        let newData = "";
        for(let r=0; r<reflects.length-1; r++){
          let reflect = reflects[r].split(":");
          if (reflect[0] === this.model.get('_id')) {
            found =  true;
            reflect[2] = this.$('.reflection__item-textbox').val();
          }
          newData += reflect[0].toString() + ':' + reflect[1].toString() + ':' + reflect[2].toString() + ','
        }
        if (found) {
          reflectionData = newData;
        } else {
          reflectionData += this.model.get('_id') + ':' + this.model.get('displayTitle') + ':' + this.$('.reflection__item-textbox').val() + ',';
        }
      }
      
      this._data = reflectionData;
      console.log(this._data);
      //save to scorm
      Adapt.offlineStorage.set('reflection_data', reflectionData);
      
      // show as saved...
      this.$('.reflection__message').addClass('is-visible');
      // show export button - if required
      if(this.model.get('exportText') != "") {
        this.$('.js-reflection-export-click').addClass('is-visible');
      }

      this.setCompletionStatus();
    },

    onExportPDF: function() {

      require(['https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.0.0/jspdf.umd.js'], ({ jsPDF }) => {
        const doc = new jsPDF();
        
        let yPos = 10;
        const leftPos = 10;
        const centerPos = 100;
        const maxWidth = 190;
        const bottomPos = 290;
        
        const d = new Date();
        const dateToday = '' + d.getDate() + (d.getMonth() + 1) + d.getFullYear() + '';
        const dateToShow = '' + d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear() + '';

        const pdfImage = this.$('.reflection__pdf-image').html();
        doc.addImage(pdfImage, 'png', leftPos, yPos, maxWidth, 53, '', 'none', 0);
        yPos += 73;
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        const pdfTitle = this.$('.reflection__pdf-title').html();
        doc.text(pdfTitle, centerPos, yPos, { align: 'center', maxWidth: maxWidth });
        yPos += 20;

        doc.setTextColor(98, 166, 10);
        doc.setFontSize(22);
        doc.setFont("helvetica", "normal");
        const pdfSubTitle = this.$('.reflection__pdf-subtitle').html();
        doc.text(pdfSubTitle, centerPos, yPos, { align: 'center', maxWidth: maxWidth });
        yPos += 20;
          
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        const pdfContentTitle = this.$('.reflection__pdf-contenttitle').html();
        doc.text(pdfContentTitle, centerPos, yPos, { align: 'center', maxWidth: maxWidth });
        yPos += 10;

        doc.setDrawColor(0);
        doc.setFillColor(98, 166, 10);
        doc.rect(leftPos, yPos, maxWidth, 1, "F");
        yPos += 15;

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(13);
        doc.setFont("helvetica", "normal");
        const pdfBody = this.$('.reflection__pdf-content').html();
        doc.text(pdfBody, centerPos, yPos, { align: 'center', maxWidth: maxWidth });
        yPos += 20;

        const reflects = this._data.split(",");
        for(let r=0; r<reflects.length-1; r++){
          const reflect = reflects[r].split(":");
            doc.setTextColor(98, 166, 10);
            doc.setFont("helvetica", "bold");
            let textTitle = reflect[1];
            doc.text(textTitle, leftPos, yPos, { align: 'left', maxWidth: maxWidth });
            yPos += 10;

            doc.setTextColor(0, 0, 0);
            doc.setFont("helvetica", "normal");
            let textAction = reflect[2];
            doc.text(textAction, leftPos, yPos, { align: 'left', maxWidth: maxWidth });
            yPos += 25;
        }

        doc.setFont("helvetica", "italic");
        doc.text(dateToShow, centerPos, bottomPos, { align: 'center', maxWidth: maxWidth });

        doc.save("reflection-" + dateToday + ".pdf");
      });

      // this.$('.reflection__message').addClass('is-visible');
      // this.$('.reflection__buttons').removeClass('is-visible');

      // this.setCompletionStatus();
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
