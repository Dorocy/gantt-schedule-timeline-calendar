/**
 * ChartTimeline component
 *
 * @copyright Rafal Pospiech <https://neuronet.io>
 * @author    Rafal Pospiech <neuronet.io@gmail.com>
 * @package   gantt-schedule-timeline-calendar
 * @license   AGPL-3.0 (https://github.com/neuronetio/gantt-schedule-timeline-calendar/blob/master/LICENSE)
 * @link      https://github.com/neuronetio/gantt-schedule-timeline-calendar
 */

import { vido } from '@neuronet.io/vido/vido';
import DeepState from 'deep-state-observer';
import { Api } from '../../../api/Api';

export default function ChartTimeline(vido: vido<DeepState, Api>, props) {
  const { api, state, onDestroy, Action, Actions, update, html, createComponent, StyleMap } = vido;
  const componentName = 'chart-timeline';

  const actionProps = { ...props, api, state };

  let wrapper;
  onDestroy(state.subscribe('config.wrappers.ChartTimeline', value => (wrapper = value)));

  const GridComponent = state.get('config.components.ChartTimelineGrid');
  const ItemsComponent = state.get('config.components.ChartTimelineItems');
  const ListToggleComponent = state.get('config.components.ListToggle');

  const Grid = createComponent(GridComponent);
  onDestroy(Grid.destroy);
  const Items = createComponent(ItemsComponent);
  onDestroy(Items.destroy);
  const ListToggle = createComponent(ListToggleComponent);
  onDestroy(ListToggle.destroy);

  let className, classNameInner;
  onDestroy(
    state.subscribe('config.classNames', () => {
      className = api.getClass(componentName);
      classNameInner = api.getClass(componentName + '-inner');
      update();
    })
  );

  let showToggle;
  onDestroy(state.subscribe('config.list.toggle.display', val => (showToggle = val)));

  const styleMap = new StyleMap({}),
    innerStyleMap = new StyleMap({});

  function calculateStyle() {
    const width = state.get('_internal.chart.dimensions.width');
    const height = state.get('_internal.list.rowsHeight');
    styleMap.style.height = state.get('_internal.innerHeight') + 'px';
    styleMap.style['--height'] = styleMap.style.height;
    if (width) {
      styleMap.style.width = width + 'px';
      styleMap.style['--width'] = width + 'px';
    } else {
      styleMap.style.width = '0px';
      styleMap.style['--width'] = '0px';
    }
    innerStyleMap.style.height = height + 'px';
    if (width) {
      innerStyleMap.style.width = width + 'px';
    } else {
      innerStyleMap.style.width = '0px';
    }
    update();
  }

  onDestroy(
    state.subscribeAll(
      [
        '_internal.innerHeight',
        '_internal.chart.dimensions.width',
        '_internal.list.rowsHeight',
        '_internal.chart.time.dates.day'
      ],
      calculateStyle
    )
  );

  let componentActions = [];
  onDestroy(
    state.subscribe('config.actions.chart-timeline', actions => {
      componentActions = actions;
    })
  );

  componentActions.push(
    class BindElementAction extends Action {
      constructor(element) {
        super();
        const old = state.get('_internal.elements.chart-timeline');
        if (old !== element) state.update('_internal.elements.chart-timeline', element);
      }
    }
  );

  const actions = Actions.create(componentActions, actionProps);
  return templateProps =>
    wrapper(
      html`
        <div class=${className} style=${styleMap} data-actions=${actions}>
          <div class=${classNameInner} style=${innerStyleMap}>
            ${Grid.html()}${Items.html()}${showToggle ? ListToggle.html() : ''}
          </div>
        </div>
      `,
      { props, vido, templateProps }
    );
}
