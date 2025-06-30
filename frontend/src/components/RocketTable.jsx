import React, { useState, useEffect, useRef } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select' // assume you have a <Select> component
import { debug } from '@/lib/utils'
import useLocalStorage from '@/hooks/useLocalStorage'

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'

const filterFns = {
  wetMassRange: (row, columnId, filterValue) => {
    const wetMass = row.getValue(columnId);
    const min = filterValue.min ?? -Infinity;
    const max = filterValue.max ?? Infinity;
    return wetMass >= min && wetMass <= max;
  },
};


export const columns = [
  {
    accessorKey: 'engine',
    header: 'Engine',
    filterFn: 'equalsString',
    cell: ({ row, getValue }) => {
      const name = getValue();
      const burnTime = row.original.burnTime;
      const ullage = row.original.ullage;
      const hpFuel = row.original.hpFuel;
      const tech = row.original.tech;
      const ignitions = row.original.ignitions;
      const gimbal = row.original.gimbal;
      const minThrust = row.original.minThrust;
      const residuals = row.original.residuals;
      const mass = row.original.engineMass;
      const fuel = row.original.fuel;

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild className="w-full text-left"><div>
              <span className='underline cursor-pointer'>{name}</span>
            </div></TooltipTrigger>
            <TooltipContent>
              <p className="text-lg max-w-md"><strong>Burn Time: </strong>{burnTime}</p>
              <p className="text-lg max-w-md"><strong>Ullage: </strong>{ullage}</p>
              <p className="text-lg max-w-md"><strong>HP Fuel: </strong>{hpFuel}</p>
              <p className="text-lg max-w-md"><strong>Tech required: </strong>{tech}</p>
              <p className="text-lg max-w-md"><strong># Ignitions: </strong>{ignitions}</p>
              <p className="text-lg max-w-md"><strong>Gimbal: </strong>{gimbal}</p>
              <p className="text-lg max-w-md"><strong>Minimum Throttle: </strong>{minThrust}</p>
              <p className="text-lg max-w-md"><strong>Residuals: </strong>{residuals}%</p>
              <p className="text-lg max-w-md"><strong>Mass: </strong>{mass}</p>
              <p className="text-lg max-w-md"><strong>Fuel: </strong>{fuel}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
  },
  {
    accessorKey: 'diameter',
    header: 'Diameter',
    filterFn: 'equals',
    sortingFn: 'basic',
  },
  {
    accessorKey: 'wetMass',
    header: 'Wet Mass (t)',
    sortingFn: 'basic',
    filterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId);
      const min = filterValue.min ?? -Infinity;
      const max = filterValue.max ?? Infinity;
      return value >= min && value <= max;
    },

  },
  {
    accessorKey: 'dryMass',
    header: 'Dry Mass (t)',
    sortingFn: 'basic',
  },
  {
    accessorKey: 'deltaVVac',
    header: 'ΔV (Vac)',
    sortingFn: 'basic',
  },
  {
    accessorKey: 'deltaVAsl',
    header: 'ΔV (ASL)',
    sortingFn: 'basic',
  },
  {
    accessorKey: 'twr',
    header: 'TWR',
    sortingFn: 'basic',
  },
  {
    accessorKey: 'num_engines',
    header: '# Tanks',
  },
  {
    accessorKey: 'cyl_length',
    header: 'Cylinder Length',
  },
  {
    accessorKey: 'cyl_fuselage',
    header: 'Cylinder Fuselage',
  },
  {
    accessorKey: 'nose_length',
    header: 'Nose Length',
  },
  {
    accessorKey: 'nose_fuselage',
    header: 'Nose Fuselage',
  },
  {
    accessorKey: 'max_altitude',
    header: 'Max Altitude',
  },
  {
    accessorKey: 'max_velocity',
    header: 'Max Velocity',
  }
]

export default function RocketTable({ wasmJsonData }) {
  const [data, setData] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [sorting, setSorting] = useState(
    [
      // 1) Primary sort: wetMass (ascending)
      { id: 'wetMass', desc: false },
    ]
  )

  const [minWetMass, setMinWetMass] = useLocalStorage("minWetMass", '');
  const [maxWetMass, setMaxWetMass] = useLocalStorage("maxWetMass", '');
  const workerRef = useRef(null)

  useEffect(() => {
    workerRef.current = new Worker(new URL('../../public/parseWorker.js', import.meta.url))
    workerRef.current.onmessage = e => {
      if (e.data.type === 'success') {
        setData(e.data.data)
      } else {
        console.error('Worker parse error:', e.data.error)
      }
    }
    return () => workerRef.current && workerRef.current.terminate()
  }, []);

  useEffect(() => {
    if (wasmJsonData && workerRef.current) {
      workerRef.current.postMessage(wasmJsonData)
    }
  }, [wasmJsonData])

  useEffect(() => {
    const min = parseFloat(minWetMass);
    const max = parseFloat(maxWetMass);

    if (!minWetMass && !maxWetMass) {
      // Clear the filter entirely
      setColumnFilters((old) => old.filter((f) => f.id !== 'wetMass'));
    } else {
      // Apply the filter with current values
      setColumnFilters((old) => {
        const without = old.filter((f) => f.id !== 'wetMass');
        return [
          ...without,
          {
            id: 'wetMass',
            value: {
              min: isNaN(min) ? undefined : min,
              max: isNaN(max) ? undefined : max,
            },
          },
        ];
      });
    }
  }, [minWetMass, maxWetMass]);

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      sorting,
    },
    state: { columnFilters, sorting },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    // Enable multi-sort so Shift+Click will add a second-level sort
    enableMultiSort: true,
  });

  const tableContainerRef = useRef(null)

  const allEngines = React.useMemo(() => {
    const setOfEngines = new Set()
    data.forEach((row) => {
      setOfEngines.add(row.engine)
    })
    return Array.from(setOfEngines).sort()
  }, [data])

  const allDiameters = React.useMemo(() => {
    const setOfDiam = new Set()
    data.forEach((row) => {
      setOfDiam.add(row.diameter)
    })
    return Array.from(setOfDiam).sort((a, b) => a - b)
  }, [data])

  const [currentEngineFilter, setCurrentEngineFilter] = useState('__all__');
  const [currentDiameterFilter, setCurrentDiameterFilter] = useState('__all__');


  const handleResetFilters = () => {
    setColumnFilters((old) =>
      old.filter(
        (f) =>
          f.id !== 'engine' &&
          f.id !== 'diameter' &&
          f.id !== 'wetMass'
      )
    );
    setCurrentEngineFilter('__all__');
    setCurrentDiameterFilter('__all__');
    setMinWetMass('');
    setMaxWetMass('');
  };
  const leafColumns = table.getAllLeafColumns()

  const allCols = table.getAllLeafColumns()
  const colWidths = allCols.map(col => `${col.getSize()}px`).join(' ')

  // 2️⃣ Virtualizer setup
  const parentRef = useRef(null)
  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
  })

  const colgroup = (
    <colgroup>
      {leafColumns.map(col => (
        <col key={col.id} style={{ width: `${col.getSize()}px` }} />
      ))}
    </colgroup>
  )

  return (
    <div className="space-y-4">
      {/* ─────────────────────────────────────────────────────────────────────── 
          UI: Engine filter dropdown 
          ─────────────────────────────────────────────────────────────────────── */}
      <div className="flex items-center space-x-2">
        <label htmlFor="engine-filter" className="font-medium">
          Filter by Engine:
        </label>
        <Select
          value={currentEngineFilter}
          onValueChange={(val) => {
            setCurrentEngineFilter(val);
            if (val === '__all__') {
              setColumnFilters((old) => old.filter((f) => f.id !== 'engine'));
            } else {
              setColumnFilters((old) => {
                const withoutEngine = old.filter((f) => f.id !== 'engine');
                return [...withoutEngine, { id: 'engine', value: val }];
              });
            }
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Engines" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Engines</SelectItem>
            {allEngines.map((eng) => (
              <SelectItem key={eng} value={eng}>
                {eng}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>


      </div>

      {/* ─────────────────────────────────────────────────────────────────────── 
          UI: Diameter filter dropdown 
          ─────────────────────────────────────────────────────────────────────── */}
      <div className="flex items-center space-x-2">
        <label htmlFor="diameter-filter" className="font-medium">
          Filter by Diameter:
        </label>
        <Select
          value={currentDiameterFilter}
          onValueChange={(val) => {
            setCurrentDiameterFilter(val);
            if (val === '__all__') {
              setColumnFilters((old) => old.filter((f) => f.id !== 'diameter'));
            } else {
              setColumnFilters((old) => {
                const withoutDiam = old.filter((f) => f.id !== 'diameter');
                return [...withoutDiam, { id: 'diameter', value: parseFloat(val) }];
              });
            }
          }}

        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Diameters" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Diameters</SelectItem>
            {allDiameters.map((diam) => (
              <SelectItem key={diam} value={diam}>
                {diam.toFixed(2)} m
              </SelectItem>

            ))}
          </SelectContent>
        </Select>

      </div>

      <div className="flex gap-2">
        <label htmlFor="minWetMass">Minimum Wet Mass</label>
        <input
          type="number"
          id="minWetMass"
          step="any"
          placeholder="Min Wet Mass"
          value={minWetMass}
          onChange={(e) => setMinWetMass(e.target.value)}
        />
        <br />
        <label htmlFor="maxWetMass">Maximum Wet Mass</label>
        <input
          type="number"
          id="maxWetMass"
          step="any"
          placeholder="Max Wet Mass"
          value={maxWetMass}
          onChange={(e) => setMaxWetMass(e.target.value)}
        />

      </div>

      <button
        onClick={handleResetFilters}
        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
      >
        Reset Filters
      </button>

      <button
        onClick={() => {
          if (parentRef.current) {
            parentRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
          }
        }}
        className="mb-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Scroll to Top
      </button>

      <div ref={tableContainerRef} style={{ height: 600, overflow: 'auto' }}>
  {/* ─── Header as Grid ─────────────────────────── */}
      <div
        className="grid items-center bg-gray-50 border-b"
        style={{ gridTemplateColumns: colWidths }}
      >
        {table.getHeaderGroups()[0].headers.map(header => (
          <div
            key={header.id}
            className="relative px-2 py-1 truncate cursor-pointer select-none"
            onClick={header.column.getToggleSortingHandler()}
          >
            <div className="truncate">
              {flexRender(header.column.columnDef.header, header.getContext())}
              {{
                asc: ' 🔼',
                desc: ' 🔽',
              }[header.column.getIsSorted()] ?? null}
            </div>
            {header.column.getCanResize() && (
              <div
                onPointerDown={e => {
                  e.stopPropagation()
                  header.getResizeHandler()(e)
                }}
                onClick={e => e.stopPropagation()}
                className="absolute right-0 top-0 h-full w-2 bg-gray-200 hover:bg-gray-400 cursor-col-resize"
              />
            )}
          </div>
        ))}
      </div>

      {/* ─── Body with Virtualized Grid Rows ─────────── */}
      <div
        ref={parentRef}
        className="overflow-y-auto"
        style={{ height: 600 }}
      >
        <div style={{ position: 'relative', height: rowVirtualizer.getTotalSize() }}>
          {rowVirtualizer.getVirtualItems().map(virtualRow => {
            const row = table.getRowModel().rows[virtualRow.index]
            return (
              <div
                key={row.id}
                className="grid items-center border-b"
                style={{
                  gridTemplateColumns: colWidths,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {row.getVisibleCells().map(cell => (
                  <div
                    key={cell.id}
                    className="px-2 py-1"
                  >
                    <div
                      className="truncate"
                      style={{
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  </div>
  )
}