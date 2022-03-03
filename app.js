import './styled.scss'
import { drag } from 'd3-drag'
import { select, selectAll } from 'd3-selection'
import transition from 'd3-transition'
import $ from 'jquery'

const svg = select('#game-1 svg')
let rooms

let deltaX, deltaY
let startX, startY
let nodeColor
let color = '#adb5bd'

function removeHightLightFromAllRooms() {
  selectAll('rect.rect-room').classed('highlight-room', false)
}

function hightLightRoom(room) {
  removeHightLightFromAllRooms()
  select(room).select('rect.rect-room').classed('highlight-room', true)
}

function forEachRoomInBoundsDo(context, callback) {
  let circle = context.getBoundingClientRect()
  let xmin = circle.left
  let ymin = circle.top
  let xmax = circle.left + circle.width
  let ymax = circle.top + circle.height

  for (const room of rooms) {
    let { x1, x2, y1, y2 } = getBoundingClientRectCoordinates(
      select(room).select('rect, path').node(),
    )

    if (x2 >= xmin && x1 <= xmax && y2 >= ymin && y1 <= ymax) {
      callback(room)
      break
    }
  }
}

let current = 'g#mapa_1'

function getBoundingClientRectCoordinates(domElement) {
  let element = domElement.getBoundingClientRect()

  return {
    x1: element.left,
    y1: element.top,
    x2: element.left + element.width,
    y2: element.top + element.height,
  }
}

let gmaps = ['g#mapa_1', 'g#mapa_2', 'g#mapa_3'].filter((g) => current !== g)

svg.selectAll(gmaps.join(', ')).attr('visibility', 'hidden')
svg.selectAll(current).attr('visibility', 'visible')

rooms = svg.selectAll(current + ' >g').nodes()
rooms = rooms.filter((_, key) => key !== 0)

for (let i = 0; i < rooms.length; i++) {
  let room = select(rooms[i])
  const NameRoom = room
    .select('text')
    .text()
    .replace(/\s|\t|\r/g, '')
  room.attr('data-nameroom', NameRoom)
}

function removingInputClearingNodeColor() {
  if (nodeColor) {
    let valText = $('.div-input-game input').val()
    if (valText) {
      select(nodeColor.node().parentNode).select('text').text(valText)
      $('.div-input-game').remove()
    }

    nodeColor.attr('stroke-width', 2)
    nodeColor = null
  }
}

const afterFirstDragInsideSquare = drag()
  .on('start', function (event) {
    removingInputClearingNodeColor()
    removeAllCloseButton(this.parentNode)
    let current = select(this).attr('transform')
    if (current) {
      let transform = current.replace(/[a-z()]+/g, '').split(/\s/)
      deltaX = parseFloat(transform[0]) - event.x
      deltaY = parseFloat(transform[1]) - event.y

      startX = transform[0]
      startY = transform[1]

      select(this.parentNode.parentNode).raise()
      $(this).addClass('active')
    }
  })
  .on('drag', function (event) {
    removeAllCloseButton(this.parentNode)
    select(this.parentNode)
      .select('g')
      .attr('transform', `translate(${event.x + deltaX} ${event.y + deltaY})`)

    let t = select(this.parentNode).select('text')
    let circle = select(this).node().getBoundingClientRect()
    t.attr(
      'transform',
      `translate(${event.x + deltaX + circle.width / 2 - 5} ${
        event.y + deltaY + circle.height / 2 + 5
      })`,
    )

    select(this).attr(
      'transform',
      'translate(' + (event.x + deltaX) + ' ' + (event.y + deltaY) + ')',
    )

    forEachRoomInBoundsDo(this, hightLightRoom)
  })
  .on('end', function () {
    let circle = this.getBoundingClientRect()
    let xmin = circle.left
    let ymin = circle.top
    let xmax = circle.left + circle.width
    let ymax = circle.top + circle.height

    $(this).removeClass('active')
    removeHightLightFromAllRooms()

    let revertToOriginalPosition = true

    for (const room of rooms) {
      let { x1, x2, y1, y2 } = getBoundingClientRectCoordinates(
        select(room).select('rect').node(),
      )

      if (
        x2 >= xmin &&
        x1 <= xmax &&
        y2 >= ymin &&
        y1 <= ymax &&
        this.parentNode.parentNode === room
      ) {
        revertToOriginalPosition = false
        break
      }
    }
    if (revertToOriginalPosition) {
      const text = select(this.parentNode).select('text')
      const textNodeBounds = text.node().getBoundingClientRect()
      text
        .transition()
        .duration(750)
        .attr(
          'transform',
          'translate(' +
            (parseFloat(startX) - textNodeBounds.width / 2 + circle.width / 2) +
            ' ' +
            (parseFloat(startY) +
              textNodeBounds.height / 4 +
              circle.height / 2) +
            ')',
        )

      select(this.parentNode)
        .select('g')
        .transition()
        .duration(750)
        .attr('transform', 'translate(' + startX + ' ' + startY + ')')

      select(this)
        .transition()
        .duration(750)
        .attr('transform', 'translate(' + startX + ' ' + startY + ')')
    }
  })

const firstDragInsideSquares = drag()
  .on('start', function (event) {
    removingInputClearingNodeColor()
    let current = select(this).attr('transform')
    if (current) {
      let transform = current.replace(/[a-z()]+/g, '').split(/\s/)
      deltaX = parseFloat(transform[0]) - event.x
      deltaY = parseFloat(transform[1]) - event.y

      startX = transform[0]
      startY = transform[1]
    } else {
      deltaX = 10 - event.x
      deltaY = 10 - event.y

      startX = 0
      startY = 0
    }
  })
  .on('drag', function (event) {
    select(this).attr(
      'transform',
      `translate(${event.x + deltaX} ${event.y + deltaY})`,
    )

    $(this).addClass('active')
    forEachRoomInBoundsDo(this, hightLightRoom)
  })
  .on('end', function (event) {
    $(this).removeClass('active')
    removeHightLightFromAllRooms()

    let circle = this.getBoundingClientRect()
    let xmin = circle.left
    let ymin = circle.top
    let xmax = circle.left + circle.width
    let ymax = circle.top + circle.height

    for (const room of rooms) {
      let { x1, x2, y1, y2 } = getBoundingClientRectCoordinates(
        select(room).select('rect, path').node(),
      )

      if (x2 >= xmin && x1 <= xmax && y2 >= ymin && y1 <= ymax) {
        let cp = select(this).node().cloneNode(true)

        let g = select(room).append('g')
        g.node().appendChild(cp)
        select(cp).attr('fill', '#adb5bd')
        let translate = getPosition(cp, event)

        let t = g.append('text')
        t.attr(
          'transform',
          `translate(${translate.x + circle.width / 2 - 5} ${translate.y + circle.height / 2 + 5})`,
        )
        t.append('tspan').text('1')
        t.on('dblclick', function (d) {
          removeAllCloseButton()
          const offset = $(this).offset()
          let valorinput = select(this).text()
          select(this).text('')

          nodeColor = select(select(this.parentNode).select('circle').node())

          $('.div-input-game').remove()
          const box = $(`
            <div class="div-input-game" style="position: fixed; left: ${offset.left}; top: ${offset.top}">
              <input type="number" value="${valorinput}" class="input-svg-game" name="quantidade" id="quantidade-svg" min=1  />
            </div>
          `)
          $('body').append(box)

          function removeTextNumber(box) {
            select(nodeColor.node().parentNode).select('text').text(box.value)
            $(box).remove()
          }

          function returnOrginValue(box) {
            select(nodeColor.node().parentNode).select('text').text(valorinput)
            $(box).remove()
          }
          box.find('input').focus()
          box
            .find('input')
            .keypress(function (e) {
              if (e.keyCode === 13 && this.value) {
                removeTextNumber(this)
              }
            })
            .on('blur', function () {
              if (this.value) {
                removeTextNumber(this)
              } else {
                returnOrginValue(this)
              }
            })
        })

        nodeColor = select(cp)
        nodeColor.attr('stroke-width', 4)

        afterFirstDragInsideSquare(nodeColor)

        nodeColor.attr(
          'transform',
          'translate(' + translate.x + ' ' + translate.y + ')',
        )

        nodeColor.on('click', function () {
          if (nodeColor) {
            nodeColor.attr('stroke-width', 2)
          }
          nodeColor = select(this)
          nodeColor.attr('stroke-width', 4)
          select(this.parentNode).selectAll('g').remove()
        })

        select(nodeColor.node().parentNode)
          .on('mouseleave', function (d, i) {
            removeAllCloseButton()
            select(this).select('circle').attr('stroke-width', 2)
          })
          .on('mouseenter', function (event, d, i) {
            removeAllCloseButton()
            event.preventDefault()

            select(this).select('circle').attr('stroke-width', 2)

            let nodeCircleEnter = select(this).select('circle')
            nodeCircleEnter.attr('stroke-width', 4)

            select(this).selectAll('g').remove()
            let text = select(this).append('text')
            text.attr('class', 'close-button')

            text.append('tspan').text('×')
            const [x, y] = transformTranslateStringToIntArray(
              select(this).select('circle').attr('transform'),
            )

            text.attr(
              'transform',
              'translate(' +
                (parseFloat(x) - 15) +
                ' ' +
                (parseFloat(y) + 16) +
                ')',
            )

            $(text.node()).click(function () {
              $(this.parentNode).remove()
            })
          })

        break
      }
    }

    select(this)
      .transition()
      .duration(750)
      .attr('transform', 'translate(' + startX + ' ' + startY + ')')
  })

select('rect#mapa_4_1_2_1').attr('stroke', '#1d1d1b').attr('stroke-width', 2)

selectAll('g#mapa_4_1_2 rect').on('click', function () {
  let colors = selectAll('g#mapa_4_1_2 rect').nodes()
  for (let i = 0; i < colors.length; i++) {
    const element = colors[i]

    select(element).attr('stroke', null)
    select(element).attr('stroke-width', null)
  }

  select(this).attr('stroke', '#1d1d1b')
  select(this).attr('stroke-width', 2)

  color = select(this).attr('fill')
  if (nodeColor) {
    nodeColor.attr('fill', color)
    nodeColor.attr('stroke-width', 2)
  }
})

firstDragInsideSquares(svg.selectAll('circle'))

function removeAllCloseButton(element) {
  if (element) {
    select(element).select('.close-button').remove()
  } else {
    select('.close-button').remove()
  }
}

function getPosition(circleElement, event) {
  let currentParent = circleElement.parentNode,
    sumX = 0,
    sumY = 0,
    circleBounds = circleElement.getBoundingClientRect()

  sumX = event.sourceEvent.pageX - circleBounds.width / 2
  sumY =
    event.sourceEvent.pageY +
    $('body').get(0).scrollTop -
    circleBounds.height / 2

  while (currentParent.nodeName !== 'svg') {
    const transform = currentParent.getAttribute('transform')
    if (transform != null) {
      const [x, y] = transformTranslateStringToIntArray(transform)
      sumX -= parseFloat(x)
      sumY -= parseFloat(y)
    }
    currentParent = currentParent.parentNode
  }
  return {
    x: sumX,
    y: sumY,
  }
}

function transformTranslateStringToIntArray(transform) {
  return transform.replace(/[a-zA-Z()]/g, '').split(' ')
}

$('body, #game-1').scroll(function (evt) {
  if (window.location.hash === '#7') {
    removeAllCloseButton()
    let div = $('.div-input-game')
    if (nodeColor && div.length) {
      select(nodeColor.node().parentNode)
        .select('text')
        .text($('.div-input-game input').val())
    }
    div.remove()
  }
})
