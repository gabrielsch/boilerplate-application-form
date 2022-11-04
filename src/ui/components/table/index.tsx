/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-array-index-key */
import React from 'react';
import classNames from 'classnames';
import styled, { keyframes } from 'styled-components';
import _ from 'lodash';
import { colors } from '../../theme/colors';
import { Text } from '../text';
import { Flexbox } from '../flexbox';
import { useTable } from './lib/hooks';
import { IconCaret } from './lib/icons';
import { Column, Cell, Direction } from './lib/types';
import * as formatters from './lib/formatters';
import { Padding } from '../padding';
import { Checkbox } from '../checkbox';

export interface TableProps<Data> {
  columns: Column<Data>[];
  initialSort?: string;
  initialSortDirection?: Direction;
  data: Data[];
  hasAllSelected?: boolean;
  limit?: number;
  loading?: boolean;
  noResults?: JSX.Element;
  offset?: number;
  selected?: Data[];
  setHasAllSelected?: (hasAllSelected: boolean) => void;
  setSelected?: (rows: Data[]) => void;
  testId?: string;
  stickyColumn?: boolean;
  maxHeight?: number;
  hasSelectableParent?: boolean;
  tableHeadBackgroundColor?: string;
}

type Data = Record<string, Cell>;

const STICKY_COLUMN_WIDTH = '300px';

function createTemplateColumns<T>(columns: Column<T>[], canSelect: boolean, stickyColumn?: boolean): string {
  const values = columns.map((column, idx) => {
    if (stickyColumn && idx === 0) {
      return `minmax(${STICKY_COLUMN_WIDTH}, ${STICKY_COLUMN_WIDTH})`;
    }
    if (column.width) {
      return `minmax(${column.width}, ${column.width})`;
    }
    return `minmax(${column.minWidth || '150px'}, 1fr)`;
  });

  if (canSelect) {
    values.unshift('50px');
  }

  return values.join(' ');
}

function Table<Data>(props: TableProps<Data>): JSX.Element {
  const {
    columns,
    data,
    loading,
    limit,
    initialSort,
    initialSortDirection,
    offset,
    selected,
    setSelected,
    hasAllSelected,
    setHasAllSelected,
    noResults = <Text>No results</Text>,
    testId,
    stickyColumn,
    maxHeight,
    hasSelectableParent,
    tableHeadBackgroundColor,
  } = props;
  const canSelect = !!setSelected;
  const table = useTable<Data>({
    data,
    initialSort,
    initialSortDirection,
    limit,
    offset,
  });

  function sortByColumn(name: string): () => void {
    return () => table.sort(name);
  }

  function toggleSelectedRow(row: Data): void {
    if (!selected || !setSelected) return; // no-op
    if (selected.indexOf(row) > -1) {
      const deselectedCopy = _.filter(selected, (n) => n !== row);
      setSelected(deselectedCopy);
    } else {
      setSelected([...selected, row]);
    }
  }

  function toggleSelectAll(): void {
    if (!setSelected || !setHasAllSelected) return; // no-op
    if (hasAllSelected) {
      setHasAllSelected(false);
      setSelected([]);
    } else {
      setHasAllSelected(true);
      setSelected(data);
    }
  }

  const selectableThClasses = classNames({
    selectable: true,
    'is-sticky-cell': stickyColumn,
  });

  return (
    <StyledTableWrapper maxHeight={maxHeight}>
      <StyledTable data-testid={testId} columns={columns} canSelect={canSelect} stickyColumn={stickyColumn}>
        <thead data-testid={`${testId}-thead`}>
          <tr>
            {canSelect && (
              <SelectableTH className={selectableThClasses} tableHeadBackgroundColor={tableHeadBackgroundColor}>
                {!hasSelectableParent && <Checkbox isActive={hasAllSelected || false} onClick={toggleSelectAll} />}
              </SelectableTH>
            )}

            {columns.map((column, idx) => {
              const { dataField, label, minWidth, sort = true, width } = column;
              // apply custom classes to these <th>s
              const thClasses = classNames({
                'is-sticky-cell': idx === 0 && stickyColumn,
                'offset-sticky-cell': canSelect && idx === 0 && stickyColumn,
              });

              return (
                <StyledTH
                  key={label}
                  onClick={sort ? sortByColumn(dataField) : undefined}
                  data-testid={`${testId}-header-${label}`}
                  isSticky={idx === 0 && stickyColumn}
                  isSortable={!!sort}
                  width={width || minWidth}
                  className={thClasses}
                  tableHeadBackgroundColor={tableHeadBackgroundColor}
                >
                  <Text color={table.currentSort === dataField ? 'active' : 'dark'} weight={600} truncate>
                    <Flexbox alignItems="center" justifyContent="space-between">
                      {label}
                      {sort ? (
                        <IconCaret direction={table.direction} isActive={table.currentSort === dataField} />
                      ) : null}
                    </Flexbox>
                  </Text>
                </StyledTH>
              );
            })}
          </tr>
        </thead>
        <tbody data-testid={`${testId}-tbody`}>
          {table.rows.map((row: Data, index: number) => {
            let isSelected = false;
            if (selected) {
              isSelected = selected.indexOf(row) > -1;
            }

            // apply custom classes to these <td>s
            const selectableTdClasses = classNames({
              'is-sticky-cell': stickyColumn,
              'is-selectable': true,
            });

            return (
              <tr data-testid={`${testId}-${index}`} key={index}>
                {canSelect && (
                  <SelectableTD className={selectableTdClasses}>
                    <Flexbox alignItems="center" height="100%">
                      <Checkbox isActive={isSelected} onClick={() => toggleSelectedRow(row)} />
                    </Flexbox>
                  </SelectableTD>
                )}
                {columns.map((column, idx) => {
                  const { dataField, label } = column;
                  const key = dataField as keyof Data;
                  const value = _.get(row, key);

                  // apply custom classes to these <td>s
                  const tdClasses = classNames({
                    'is-sticky-cell': idx === 0 && stickyColumn,
                    'offset-sticky-cell': canSelect && idx === 0 && stickyColumn,
                  });

                  return (
                    <StyledTD className={tdClasses} key={label}>
                      <Flexbox alignItems="center" height="100%">
                        {column.format(value as any, row, isSelected)}
                      </Flexbox>
                    </StyledTD>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </StyledTable>
      {loading ? <StyledTableLoader data-testid={`${testId}-loading`} /> : null}
      {table.rows.length === 0 && !loading ? (
        <Padding size={40}>
          <Flexbox justifyContent="center">{noResults}</Flexbox>
        </Padding>
      ) : null}
    </StyledTableWrapper>
  );
}

export { Table, formatters };

/* custom border colors = colors.steel[200] with alpha */
const borderColor = 'rgb(190, 199, 208, 0.5)';

/**
 * StyledTableWrapper
 * We may want to set a max height of a table.
 * This will mean that once a table reaches that maxHeight, it will scroll vertically
 */

const StyledTableWrapper = styled.div<{ maxHeight?: number }>`
  height: ${({ maxHeight }) => (maxHeight ? `${maxHeight}px` : '100%')};
  overflow-y: scroll;
`;

/**
 * sharedStickyPsuedoStyles
 * These 2 elements add additional style to a '.is-sticky-cell' - and are shared with StyledTH and StyledTD
 * The :before adds a 1px wide vertical column to give the appearance of a border
 * The :after renders a shadow to visualize the stacking of the sticky element above anything being scrolled behind
 */

const sharedStickyPsuedoStyles = `
  &:before {
    background-color: ${colors.steel[200]};
    bottom: 0;
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    width: 1px;
  }

  &:after {
    background: linear-gradient(90deg, rgba(0,0,0,0.05) 0%, rgba(255,255,255,0) 100%);
    bottom: 0;
    content: '';
    position: absolute;
    right: -4px;
    top: 0;
    width: 4px;
  }
`;

/**
 * StyledTH
 */

interface PropsTH {
  width?: string;
  isSortable?: boolean;
  isSticky?: boolean;
  tableHeadBackgroundColor?: string;
}

const StyledTH = styled.th<PropsTH>`
  background: ${({ tableHeadBackgroundColor }) => tableHeadBackgroundColor || '#fff'};
  box-shadow: 0 -1px ${borderColor} inset;
  box-sizing: border-box;
  cursor: ${({ isSortable }) => (isSortable ? 'pointer' : 'default')};
  min-width: ${({ width }) => width || '150px'};
  padding: 16px;
  position: sticky;
  text-align: left;
  top: 0;
  transition: background 100ms ease-in-out;
  z-index: 5;

  /*
   * if the TH cell .is-sticky-cell
   * override it's width and positioning
   * apply shared psuedo elements
   */

  &.is-sticky-cell {
    ${sharedStickyPsuedoStyles};
    left: 0;
    width: ${STICKY_COLUMN_WIDTH};
    z-index: 10;
  }

  /*
   * if the cell has .offset-sticky-cell
   * we need to allow room for a previous checkbox element which we knows is 52px wide
   */

  &.offset-sticky-cell {
    left: 52px;
    padding-left: 0;
  }

  &:hover {
    color: ${colors.brand[400]};
  }

  &:last-child {
    border: 0;
  }
`;

/**
 * SelectableTH
 * Custom styles for a <th> with a <Checkbox /> inside.
 * It doesnt need all the rules that StyledTH has.
 */

const SelectableTH = styled.th<{ tableHeadBackgroundColor?: string }>`
  background: ${({ tableHeadBackgroundColor }) => tableHeadBackgroundColor || '#fff'};
  box-shadow: 0 -1px ${borderColor} inset;
  box-sizing: border-box;
  min-width: 52px;
  padding: 16px;
  position: sticky;
  text-align: left;
  top: 0;
  transition: background 100ms ease-in-out;
  z-index: 10;

  /*
   * if .is-sticky-cell
   * override it's width, padding and positioning
   */

  &.is-sticky-cell {
    left: 0;
  }
`;

/**
 * StyledTD
 */

const StyledTD = styled.td`
  box-shadow: 0 -1px ${borderColor} inset;
  box-sizing: border-box;
  padding: 10px 16px;
  text-align: left;
  transition: background 100ms ease-in-out;

  /*
   * if the TD cell .is-sticky-cell
   * override it's width, positioning and appearance
   * apply shared psuedo elements
   */

  &.is-sticky-cell {
    ${sharedStickyPsuedoStyles};
    left: 0;
    width: ${STICKY_COLUMN_WIDTH};
    position: sticky;
    z-index: 5;
    display: block;
  }

  &.is-sticky-cell:not(is-selectable) {
    /* align column sort arrows with sticky column action menu - hence 9px */
    padding-right: 9px;
  }

  /*
   * if the cell has .offset-sticky-cell
   * we need to allow room for a previous checkbox element which we knows is 35px wide
   */

  &.offset-sticky-cell {
    left: 52px;
    padding-left: 0;
  }

  &.isLoading {
    cursor: not-allowed;
    position: relative;
  }

  &.isLoading :after {
    background-color: transparent;
    bottom: 0;
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 5;
  }

  td.isLoading > * {
    opacity: 0.4;
    transition: opacity 100ms ease-in-out;
  }
`;

/**
 * SelectableTD
 * Custom styles for a <td> with a <Checkbox /> inside.
 * It doesnt need all the rules that StyledTD has.
 */

const SelectableTD = styled.td`
  box-shadow: 0 -1px ${borderColor} inset;
  box-sizing: border-box;
  min-width: 52px;
  padding: 16px;
  position: sticky;
  text-align: left;
  top: 0;
  z-index: 5;

  /*
   * if .is-sticky-cell
   * override it's width, padding, appearance and positioning
   */

  &.is-sticky-cell {
    left: 0;
  }
`;

const loading = keyframes`
  0% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.3;
  }
`;

const StyledTableLoader = styled.div`
  animation: ${loading} 1500ms linear;
  animation-iteration-count: infinite;
  background-image: repeating-linear-gradient(
    180deg,
    ${colors.brand[100]} 0px,
    ${colors.brand[100]} 60px,
    transparent 60px,
    transparent 120px
  );
  height: 420px;
`;

/**
 * defaultGridLayout
 * These are the styles for our default table appearance.
 * It depends on knowing EXACTLY how may columns we have - and calculating a width.
 * This will NOT work with responsive tables. (showing/hiding columns)
 * We pass our 'columns' and 'canSelect' off to createTemplateColumns to calculate minmax() grid styles
 * We also pass it stickyColumn. Currently we want the 1st column to be 300px. This may change in the future.
 * To render the CSSGrid correctly thead, tbody and tr elements need to be `display: contents`
 * https://css-tricks.com/get-ready-for-display-contents/
 */

interface StyledTableProps {
  columns: Column<Data>[];
  canSelect: boolean;
  stickyColumn?: boolean;
}

/**
 * StyledTable
 */
const StyledTable = styled.table<StyledTableProps>`
  background: white;
  border-collapse: collapse;
  min-width: 100%;
  overflow-x: auto;

  display: grid;
  grid-template-columns: ${({ columns, canSelect, stickyColumn }) =>
    createTemplateColumns<Data>(columns, canSelect, stickyColumn)};

  thead,
  tbody,
  tr {
    display: contents;
  }

  tr:last-child td {
    box-shadow: none;
  }

  /** zebra striping - colors.steel[200] with alpha */
  tr:nth-child(even) td {
    background: rgb(190, 199, 208, 0.05);
  }
`;
