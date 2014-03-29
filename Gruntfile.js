/**
 * This grunt file:
 * renders scss, combines and minifies scss and css 
 * combines, uglifies and validates js files
 * moves and minifies images
 * 
 * Three grunt commands are available
 * bootstrap - use this to pull in any added package (bower) content
 * watch - watch the script and css files for changes and thus rendered content
 * validates 
 */

/////   !DEFINE THE FILES IN PLAY 

/**
 * Add any folders to imports from package content
 */ 
var style_imports = ['bower_components/foundation/scss/',  'bower_components/bower-compass-core/compass/stylesheets/', 'bower_components/CaliforniaJobCase/sass/'];

/**
 * Replaces the default folder in a css documents url() statements 
 * ensures that they point to the image folder
 * no need to change url('images/*.css)
 * files - is the name of the file to replace
 * folder - the original folder name to replace
 */
var update_css_paths = {
  files: ['bower_components/fancybox/source/jquery.fancybox.css'],
  folders: [""] 
}

/**
 * Add any scripts from package contents or partials
 */
var script_imports = ['bower_components/foundation/js/foundation.js', 'bower_components/modernizr/modernizr.js', 'bower_components/fancybox/source/jquery.fancybox.js'];

/**
 * Add any images folders from package content
 */
var image_imports = ['bower_components/fancybox/source/'];
/**
 * Add any css settings files that will need to be customized in the sass
 */
var settings_files = ['bower_components/CaliforniaJobCase/sass/_cjc_settings.scss', 'bower_components/foundation/scss/foundation/_settings.scss'];

/////   !EXPANSION AND FORMATING OF FILE DEF VARIABLES

update_css_paths = expandUpdateCssPath(update_css_paths);
script_imports = expandScriptImports(script_imports);
image_imports = expandImageImports(image_imports);
settings_files = expandSettingsFiles(settings_files);

/////   !EXPANSION AND FORMATING FUNCTIONS

function expandUpdateCssPath(css_elements){
  var new_css_elements = {
    files: {},
    replacements: []
  };
  for($i = 0; css_elements.files.length > $i; $i++){
    var file = css_elements.files[$i].split("/").pop();
    new_css_elements.files['css/renders/' + file] = css_elements.files[$i];
  }
  for($i = 0; css_elements.folders.length > $i; $i++){
    var new_pattern = "url\\(\\'" + css_elements.folders[$i] + "(.*?\\..*?)'\\)";
    new_pattern = new RegExp(new_pattern, "g");
    var replacement = {
        pattern: new_pattern,
        replacement: 'url(\'images/$1\')'
    }
    new_css_elements.replacements.push(replacement); 
  }
  return new_css_elements;
}

function expandScriptImports(scripts_elements){
  scripts_elements.push('js/scripts/app.js');
  console.log(scripts_elements);
  return scripts_elements;
  
}

function expandImageImports(image_elements){
  var new_image_element = [];
  for($i = 0; image_elements.length > $i; $i++){
    var details = {
      expand: true, 
      src: [image_elements[$i] + '*.{gif,jpg,png}'], 
      dest: 'images/moved/', 
      flatten: true, 
      filter: 'isFile'
    };
    new_image_element.push(details);
  }
  return new_image_element;
}

function expandSettingsFiles(setting_elements){
  var new_setting_elemens = [];
  for($i = 0; setting_elements.length > $i; $i++){
    var details = {
      expand: true, 
      src: [setting_elements[$i]], 
      dest: 'css/scss/', 
      flatten: true, 
      filter: function(filepath) {
        var newfile = filepath.split('/').pop();
        newfile = details.dest + newfile;
        var grunt = require('grunt');
        return !(grunt.file.exists(newfile));
      },
    };
    new_setting_elemens.push(details);
  }
  return new_setting_elemens;
}

/////   !GRUNT INIT

module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		sass: {
			dist: {                           
        options: { 
          require: 'sass-css-importer',                      
          loadPath: style_imports
          
        },
        files: {                         
          'css/renders/app.css' : 'css/scss/app.scss',
          'css/ie.css' : 'css/scss/ie.scss' // break this out if you keep using it    
        }
      }
		},
		
		'string-replace': {
      dist: {
        files: update_css_paths.files,
        options: {
          replacements: update_css_paths.replacements
        }
      }
		},
		
		uglify: {
      my_target: {
        options: {
          mangle:false,
          preserveComments: 'some'
        },
        files: {
          'js/app.min.js': script_imports
        }
      }
    },
    
    cssmin: {
      combine: {
        src: ['css/renders/*.css'],
        dest: 'css/app.min.css',
      }
    },
		
		watch: {
			css: {
				files: 'css/scss/*.scss',
				tasks: ['sass', 'cssmin']
			},
			js: {
        files: ['js/scripts/*.js'],
        tasks: ['uglify']
      }
		},
		
		jshint: {
		  default: ['js/scripts/*.js'],
      min: ['js/*.js'],
      source: script_imports
    },
		
		copy: {
      images: {
        files: image_imports
      },
      settings: {
        files: settings_files
      }
    },
          
    imagemin: {                         
      dynamic: {                        
        files: [{
          expand: true,                  
          cwd: 'images/moved/',       
          src: ['*.{png,jpg,gif}'], 
          dest: 'images/'               
        }]
      }
    }	
	});
	
/////   !GRUNT REQUIRES

	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-string-replace');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	
/////   !GRUNT COMAND DEFINITIONS

	grunt.registerTask('bootstrap',['string-replace', 'copy', 'imagemin', 'uglify']);
	grunt.registerTask('validate',['jshint:default']);
	grunt.registerTask('validate-source',['jshint:source']);
	grunt.registerTask('validate-min',['jshint:min']);
}