/*** Directives and services for responding to idle users in AngularJS
* @author Mike Grabski <me@mikegrabski.com>
* @version v1.1.0
* @link https://github.com/HackedByChinese/ng-idle.git
* @license MIT
*/
(function(window, angular, undefined) {
'use strict';
angular.module('ngIdle', ['ngIdle.keepalive', 'ngIdle.idle', 'ngIdle.countdown', 'ngIdle.title', 'ngIdle.localStorage']);
angular.module('ngIdle.keepalive', [])
  .provider('Keepalive', function() {
    var options = {
      http: null,
      interval: 10 * 60
    };

    this.http = function(value) {
      if (!value) { throw new Error('Argument must be a string containing a URL, or an object containing the HTTP request configuration.'); }
      if (angular.isString(value)) {
        value = {
          url: value,
          method: 'GET'
        };
      }

      value.cache = false;

      options.http = value;
    };

    var setInterval = this.interval = function(seconds) {
      seconds = parseInt(seconds);

      if (isNaN(seconds) || seconds <= 0) { throw new Error('Interval must be expressed in seconds and be greater than 0.'); }
      options.interval = seconds;
    };

    this.$get = ['$rootScope', '$log', '$interval', '$http',
      function($rootScope, $log, $interval, $http) {

        var state = {
          ping: null
        };

        function handleResponse(data, status) {
          $rootScope.$broadcast('KeepaliveResponse', data, status);
        }

        function ping() {
          $rootScope.$broadcast('Keepalive');

          if (angular.isObject(options.http)) {
            $http(options.http)
              .success(handleResponse)
              .error(handleResponse);
          }
        }

        return {
          _options: function() {
            return options;
          },
          setInterval: setInterval,
          start: function() {
            $interval.cancel(state.ping);

            state.ping = $interval(ping, options.interval * 1000);
            return state.ping;
          },
          stop: function() {
            $interval.cancel(state.ping);
          },
          ping: function() {
            ping();
          }
        };
      }
    ];
  });

angular.module('ngIdle.idle', ['ngIdle.keepalive', 'ngIdle.localStorage'])
  .provider('Idle', function() {
    var options = {
      idle: 20 * 60, // in seconds (default is 20min)
      timeout: 30, // in seconds (default is 30sec)
      autoResume: 'idle', // lets events automatically resume (unsets idle state/resets warning)
      interrupt: 'mousemove keydown DOMMouseScroll mousewheel mousedown touchstart touchmove scroll',
      keepalive: true,
      titleDisabled: false // disable changes in document's title
    };

    /**
     *  Sets the number of seconds a user can be idle before they are considered timed out.
     *  @param {Number|Boolean} seconds A positive number representing seconds OR 0 or false to disable this feature.
     */
    var setTimeout = this.timeout = function(seconds) {
      if (seconds === false) { options.timeout = 0; }
      else if (angular.isNumber(seconds) && seconds >= 0) { options.timeout = seconds; }
      else { throw new Error('Timeout must be zero or false to disable the feature, or a positive integer (in seconds) to enable it.'); }
    };

    this.interrupt = function(events) {
      options.interrupt = events;
    };

    var setIdle = this.idle = function(seconds) {
      if (seconds <= 0) { throw new Error('Idle must be a value in seconds, greater than 0.'); }

      options.idle = seconds;
    };

    var setTitleDisabled = this.titleDisabled = function(disabled) {
      options.titleDisabled = disabled === true;
    };

    this.autoResume = function(value) {
      if (value === true) { options.autoResume = 'idle'; }
      else if (value === false) { options.autoResume = 'off'; }
      else { options.autoResume = value; }
    };

    this.keepalive = function(enabled) {
      options.keepalive = enabled === true;
    };

    this.$get = ['$interval', '$log', '$rootScope', '$document', 'Keepalive', 'IdleLocalStorage', '$window',
      function($interval, $log, $rootScope, $document, Keepalive, LocalStorage, $window) {
        var state = {
          idle: null,
          timeout: null,
          idling: false,
          running: false,
          countdown: null
        };

        var id = new Date().getTime();

        function startKeepalive() {
          if (!options.keepalive) { return; }

          if (state.running) { Keepalive.ping(); }

          Keepalive.start();
        }

        function stopKeepalive() {
          if (!options.keepalive) { return; }

          Keepalive.stop();
        }

        function timeout() {
          stopKeepalive();
          $interval.cancel(state.idle);
          $interval.cancel(state.timeout);

          state.idling = true;
          state.running = false;
          state.countdown = 0;

          $rootScope.$broadcast('IdleTimeout');
        }

        function countdown() {
          // countdown has expired, so signal timeout
          if (state.countdown <= 0) {
            timeout();
            return;
          }

          // countdown hasn't reached zero, so warn and decrement
          $rootScope.$broadcast('IdleWarn', state.countdown);
          state.countdown--;
        }

        function toggleState() {
          state.idling = !state.idling;
          var name = state.idling ? 'Start' : 'End';

          $rootScope.$broadcast('Idle' + name);

          if (state.idling) {
            stopKeepalive();
            if (options.timeout) {
              state.countdown = options.timeout;
              countdown();
              state.timeout = $interval(countdown, 1000, options.timeout, false);
            }
          } else {
            startKeepalive();
          }

          $interval.cancel(state.idle);
        }

        function changeOption(self, fn, value) {
          var reset = self.running();

          self.unwatch();
          fn(value);
          if (reset) { self.watch(); }
        }

        function getExpiry() {
          var obj = LocalStorage.get('expiry');

          return obj && obj.time ? new Date(obj.time) : null;
        }

        function setExpiry(date) {
          if (!date) { LocalStorage.remove('expiry'); }
          else { LocalStorage.set('expiry', {id: id, time: date}); }
        }

        var svc = {
          _options: function() {
            return options;
          },
          _getNow: function() {
            return new Date();
          },
          getIdle: function(){
            return options.idle;
          },
          getTimeout: function(){
            return options.timeout;
          },
          setIdle: function(seconds) {
            changeOption(this, setIdle, seconds);
          },
          setTitleDisabled: function(disabled) {
            changeOption(this, setTitleDisabled, disabled);
          },
          isTitleDisabled: function() {
            return options.titleDisabled;
          },
          setTimeout: function(seconds) {
            changeOption(this, setTimeout, seconds);
          },
          isExpired: function() {
            var expiry = getExpiry();
            return expiry !== null && expiry <= this._getNow();
          },
          running: function() {
            return state.running;
          },
          idling: function() {
            return state.idling;
          },
          watch: function(noExpiryUpdate) {
            $interval.cancel(state.idle);
            $interval.cancel(state.timeout);

            // calculate the absolute expiry date, as added insurance against a browser sleeping or paused in the background
            var timeout = !options.timeout ? 0 : options.timeout;
            if (!noExpiryUpdate) { setExpiry(new Date(new Date().getTime() + ((options.idle + timeout) * 1000))); }


            if (state.idling) { toggleState(); } // clears the idle state if currently idling
            else if (!state.running) { startKeepalive(); } // if about to run, start keep alive

            state.running = true;

            state.idle = $interval(toggleState, options.idle * 1000, 0, false);
          },
          unwatch: function() {
            $interval.cancel(state.idle);
            $interval.cancel(state.timeout);

            state.idling = false;
            state.running = false;
            setExpiry(null);

            stopKeepalive();
          },
          interrupt: function(noExpiryUpdate) {
            if (!state.running) { return; }

            if (options.timeout && this.isExpired()) {
              timeout();
              return;
            }

            // note: you can no longer auto resume once we exceed the expiry; you will reset state by calling watch() manually
            if (options.autoResume === 'idle' || (options.autoResume === 'notIdle' && !state.idling)) { this.watch(noExpiryUpdate); }
          }
        };

        $document.find('body').on(options.interrupt, function() {
          svc.interrupt();
        });

        var wrap = function(event) {
          if (event.key === 'ngIdle.expiry' && event.newValue !== event.oldValue) {
            var val = angular.fromJson(event.newValue);
            if (val.id === id) { return; }
            svc.interrupt(true);
          }
        };

        if ($window.addEventListener) { $window.addEventListener('storage', wrap, false); }
        else { $window.attachEvent('onstorage', wrap); }

        return svc;
      }
    ];
  });

angular.module('ngIdle.countdown', ['ngIdle.idle'])
  .directive('idleCountdown', ['Idle', function(Idle) {
    return {
      restrict: 'A',
      scope: {
        value: '=idleCountdown'
      },
      link: function($scope) {
        // Initialize the scope's value to the configured timeout.
        $scope.value = Idle.getTimeout();

        $scope.$on('IdleWarn', function(e, countdown) {
          $scope.$evalAsync(function() {
            $scope.value = countdown;
          });
        });

        $scope.$on('IdleTimeout', function() {
          $scope.$evalAsync(function() {
            $scope.value = 0;
          });
        });
      }
    };
  }]);

angular.module('ngIdle.title', [])
  .factory('Title', ['$document', '$interpolate', function($document, $interpolate) {

    function padLeft(nr, n, str){
      return new Array(n-String(nr).length+1).join(str||'0')+nr;
    }

    var state = {
      original: null,
      idle: '{{minutes}}:{{seconds}} until your session times out!',
      timedout: 'Your session has expired.'
    };

    return {
      original: function(val) {
        if (angular.isUndefined(val)) { return state.original; }

        state.original = val;
      },
      store: function(overwrite) {
        if (overwrite || !state.original) { state.original = this.value(); }
      },
      value: function(val) {
        if (angular.isUndefined(val)) { return $document[0].title; }

        $document[0].title = val;
      },
      idleMessage: function(val) {
        if (angular.isUndefined(val)) { return state.idle; }

        state.idle = val;
      },
      timedOutMessage: function(val) {
        if (angular.isUndefined(val)) { return state.timedout; }

        state.timedout = val;
      },
      setAsIdle: function(countdown) {
        this.store();

        var remaining = { totalSeconds: countdown };
        remaining.minutes = Math.floor(countdown/60);
        remaining.seconds = padLeft(countdown - remaining.minutes * 60, 2);

        this.value($interpolate(this.idleMessage())(remaining));
      },
      setAsTimedOut: function() {
        this.store();

        this.value(this.timedOutMessage());
      },
      restore: function() {
        if (this.original()) { this.value(this.original()); }
      }
    };
  }])
  .directive('title', ['Idle', 'Title', function(Idle, Title) {
      return {
        restrict: 'E',
        link: function($scope, $element, $attr) {
          if (Idle.isTitleDisabled() || $attr.idleDisabled) { return; }

          Title.store(true);

          $scope.$on('IdleStart', function() {
            Title.original($element[0].innerText);
          });

          $scope.$on('IdleWarn', function(e, countdown) {
            Title.setAsIdle(countdown);
          });

          $scope.$on('IdleEnd', function() {
            Title.restore();
          });

          $scope.$on('IdleTimeout', function() {
            Title.setAsTimedOut();
          });
        }
      };
  }]);

angular.module('ngIdle.localStorage', [])
  .service('IdleLocalStorage', ['$window', function($window) {
    var storage = $window.localStorage;

    return {
      set: function(key, value) {
        storage.setItem('ngIdle.'+key, angular.toJson(value));
      },
      get: function(key) {
        return angular.fromJson(storage.getItem('ngIdle.'+key));
      },
      remove: function(key) {
        storage.removeItem('ngIdle.'+key);
      }
    };
  }]);

})(window, window.angular);
