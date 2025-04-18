const Analytics = {
    trackPageView: function(pageName) {
      gtag('event', 'page_view', {
        'page_title': pageName,
        'page_location': window.location.href,
        'page_path': window.location.pathname
      });
    },
    
    trackFileUpload: function(fileType, fileSize, fileName) {
      gtag('event', 'file_upload', {
        'event_category': 'File Actions',
        'event_label': fileName,
        'file_type': fileType,
        'file_size': fileSize
      });
    },
    
    trackFileDownload: function(fileName, fileType) {
      gtag('event', 'file_download', {
        'event_category': 'File Actions',
        'event_label': fileName,
        'file_type': fileType
      });
    },
    
    trackFileDeletion: function(fileName) {
      gtag('event', 'file_deletion', {
        'event_category': 'File Actions',
        'event_label': fileName
      });
    },

    trackUserAuth: function(action, method) {
      gtag('event', action, {
        'event_category': 'Authentication',
        'event_label': method
      });
    },

    trackSearch: function(searchTerm, resultsCount) {
      gtag('event', 'search', {
        'event_category': 'User Interaction',
        'event_label': searchTerm,
        'search_term': searchTerm,
        'results_count': resultsCount
      });
    },

    trackPerformance: function() {
      if (window.performance) {
        const navEntry = performance.getEntriesByType('navigation')[0];
        gtag('event', 'performance', {
          'event_category': 'Performance',
          'event_label': window.location.pathname,
          'page_load_time': Math.round(navEntry.loadEventEnd - navEntry.startTime),
          'dom_interactive_time': Math.round(navEntry.domInteractive - navEntry.startTime),
          'dom_complete_time': Math.round(navEntry.domComplete - navEntry.startTime)
        });
      }
    }
  };
  
  window.addEventListener('load', function() {
    Analytics.trackPageView(document.title);
    Analytics.trackPerformance();
  });
  