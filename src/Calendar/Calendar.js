(function(root, factory) {
  typeof exports === 'object' && typeof module !== undefined ? module.exports = factory()
  : typeof define === 'function' && define.amd ? define(factory)
  : (root = root|| self, root.Calendar = factory())
})(this, function() {
  /**
   * options:
   */
  var header = ['日', '一', '二', '三', '四', '五', '六'];
  function Calendar(options) {
    this.$options = options
    var date = new Date();
    this.render(date.getFullYear(), date.getMonth() + 1)
  }

  Calendar.prototype.render = function(year, month) {
    this.year = year;
    this.month = month;

    var daysArr = this.getMonthDaysArray(this.year, this.month);
    this.daysOfMonth = daysArr;

    var dom = this.generateDom(header, daysArr);

    var selecttor = this.generateSelectorDom();
    document.querySelector(this.$options.el).innerHTML = selecttor + '<div class="main">' + dom + '</div>';;

    this.bindEvent()
  }

  Calendar.prototype.bindEvent = function () {
    var _ = this;
    var yearSelector = document.querySelector('select.year');
    var monthSelector = document.querySelector('select.month');
    yearSelector.addEventListener('change', function(e) {
      var year = e.target.value;
      _.selectChange(year, _.month);
    })
    monthSelector.addEventListener('change', function(e) {
      var month = e.target.value;
      _.selectChange(_.year, month);
    })

    document.querySelector('.selector .op').addEventListener('click', function (e) {
      if (e.target.nodeName === 'SPAN') {
        var direction = e.target.getAttribute('data-direction');
        if (direction === 'prev') {
          var month = _.month - 1;
        } else {
          var month = _.month + 1;
        }
        var year = _.year;

        if (month === 0) {
          year = year - 1;
          month = 12;
        } else if (month === 13) {
          year = year + 1;
          month = 1;
        }

        console.log(year, month)

        yearSelector.selectedIndex = year - 1900;
        monthSelector.selectedIndex = month - 1;
        _.selectChange(year, month)
      }
    })
  }

  Calendar.prototype.selectChange = function(year, month) {
    // 对前后进行修正
    if (month == 0) {
      year = year - 1;
      month = 12;
    } else if (month == 13) {
      year = year + 1;
      month = 1;
    }

    this.year = year;
    this.month = month;

    var daysArr = this.getMonthDaysArray(year, month);
    this.daysOfMonth = daysArr;

    var dom = this.generateDom(header, daysArr);
    document.querySelector('#calendar .main').innerHTML = dom;
  }

  /*
  *  获取某年某月有多少天
  *  new Date(year, month, day) month的取值为0-11 day为一个月的第几天 默认从1开始 
  *  new Date(2020, 11, 1) 为2020年12月的第一天
  *  new Date(2020, 11, 0) 为2020年12月的第0天即11月的最后一天
  */
  Calendar.prototype.getMonthDays = function(year, month) {
    return new Date(year, month, 0).getDate();
  }

  /**
   * 获取某一天为星期几
   * getDate()返回的为1-31 这个月的几号
   * getDay()原始返回的为0-6 星期几 0位星期天
   */
  Calendar.prototype.getWeekDay = function(year, month, day) {
    return new Date(year, month - 1, day).getDay();
  }

  /**
   * 获取一个月有几周
   * 举例  以2010年1月为例 1号为星期三 1月有31天
   * 周日为每周的第一天 (31 - (7-3)) / 7 + 1 = (31 - 7 + 3 +7) / 7 = (31 + 3) / 7
   * 
   */
  Calendar.prototype.getWeeksOfMonth = function(year, month) {
    var days = this.getMonthDays(year, month);
    var firstDay = this.getWeekDay(year, month, 1);
    return Math.ceil((firstDay + days) / 7)
  }

  /**
  * 将每个月的数据组装成二维数组 
  * 组装思路
  * 先对第一周进行处理
  * 如果第一天为周三 firstDay = 3 那么arr[0][firstDay] = 1;后面累加
  * 对前面上个月的数据进行单独处理 获取到上个月的天数 day arr[0][firstDay - i ] = day - i  arr[0][1] = day -2 arr[0][0] = day - 3
  * 后面的行数以此累加
  * 然后对最后一行进行修正
  * nextDay是累加的  如果这个月为30天 且30号为周六 那么到最后nextDay为31 nextDay - 1 - days == 0
  * 如果30号为周五  那么nextDay 为 32 nextDay - 1 - days = 1 即最后两天需要被修正 7-1 = 6 修正第六天
  * 如果30号为周四  那么nextDay 为 33 nextDay - 1 - days = 2 即最后两天需要被修正 7-1 = 6 修正第六天 7-2 = 5 修正第五天
  */
  Calendar.prototype.getMonthDaysArray = function(year, month) {
    var arr = [];
    var days = this.getMonthDays(year, month);
    var firstDay = this.getWeekDay(year, month, 1);
    var weeks = this.getWeeksOfMonth(year, month);

    // 填充第一行
    var nextDay = 1;
    arr[0] = [];
    for (var i = firstDay; i < 7; i++) {
      arr[0][i] = {
        day: nextDay,
        week: i,
        month: 'current'
      };
      nextDay ++;
    } 
    if (firstDay !== 0) {
      var lastMonthDays = this.getMonthDays(year, month - 1);
      var i = 1;
      while (firstDay - i >= 0) {
        arr[0][firstDay - i] = {
            day: lastMonthDays - i + 1,
            week: firstDay - i,
            month: 'prev'
          }
          i ++;
      }
      // var i = firstDay - 1;
      // var j = 0;
      // while (i >= 0) {
      //   arr[0][i] = {
      //     day: lastMonthDays - j,
      //     week: i,
      //     month: 'prev'
      //   };
      //   i--;
      //   j++;
      // }
    }
    // 填充后面的行数
    for (var i = 1; i < weeks; i ++) {
      arr[i] = [];
      for (var j = 0; j < 7; j++) {
        arr[i].push({
          day: nextDay,
          week: j,
          month: 'current'
        })
        nextDay ++;
      }
    }

    // 对最后一行进行修正
    var count = nextDay -  1 - days;
    if (count > 0) {
      // 需要修正
      var j = count;
      var i = 1;
      while (j > 0) {
        arr[weeks - 1][7 - j]['day'] = i;
        arr[weeks - 1][7 - j]['month'] = 'next';
        j --;
        i++;
      }
    }

    return arr;
  }

  Calendar.prototype.getOptions = function(start, end) {
    var options = []
    while (start <= end) {
      options.push(start)
      start ++;
    }

    return options;
  }

  Calendar.prototype.generateDom = function(header, arr) {
    // 选择框
    var headerDom = '<div class="header">';
    for (var i = 0; i < header.length; i ++) {
      headerDom += '<div class="item">' + header[i] + '</div>'
    }
    headerDom += '</div>'

    var containerDom = '<div class="container">'
    for (var i = 0; i < arr.length; i++) {
      var row = arr[i];
      var rowDom = '<div class="row">'
      for (var j = 0; j < row.length; j++) {
        rowDom += '<div class="item' + (row[j].month === 'current' ? ' active' : '') + '" data-x=' + i + ' data-y=' + j + ' data-month=' + row[j].month +'>' + row[j].day +'</div>'
      }
      rowDom += '</div>'
      containerDom += rowDom;
    }
    containerDom += '</div>'

    var dom = headerDom + containerDom;
    return dom;
  }

  Calendar.prototype.generateSelectorDom = function () {
    var yearOptions = this.getOptions(1900, 2100);
    var monthOptons = this.getOptions(1, 12);

    var yearSelectDom = '<select class="year">'
    for (var i = 0; i < yearOptions.length; i++) {
      var year = yearOptions[i];
      yearSelectDom = yearSelectDom + '<option' + (year === this.year ? ' selected' : '') + ' value="' + year + '">' + year + '年</option>'
    }
    yearSelectDom += '</select>'

    var monthSelectDom = '<select class="month">'
    for (var i = 0; i < monthOptons.length; i++) {
      var month = monthOptons[i];
      monthSelectDom = monthSelectDom + '<option' + (month === this.month ? ' selected' : '') + ' value="' + month + '">' + month + '月</option>'
    }
    monthSelectDom += '</select>'

    return '<div class="selector">' + yearSelectDom + monthSelectDom + '<div class="op"><span data-direction="prev"><-</span><span data-direction="next">-></span></div>' + '</div>'
  }

  return Calendar;
})