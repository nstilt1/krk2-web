import React, { useState, useEffect } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table'

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
]

export default function RocketTable({ wasmJsonData }) {
  const [data, setData] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [sorting, setSorting] = useState(
    [
      // 1) Primary sort: diameter (ascending)
      { id: 'diameter', desc: false },
      // 2) Secondary sort: deltaVVac (descending)
      { id: 'deltaVVac', desc: true },
    ]
  )

  const [minWetMass, setMinWetMass] = useLocalStorage("minWetMass", '');
  const [maxWetMass, setMaxWetMass] = useLocalStorage("maxWetMass", '');

  useEffect(() => {
    try {
      debug('Parsing incoming WASM JSON…')
      const parsed = JSON.parse(wasmJsonData).map((r) => ({
        engine: r.engine,
        diameter: r.diameter,
        wetMass: r.wetMass,
        dryMass: r.dryMass,
        deltaVVac: r.deltaVVac,
        deltaVAsl: r.deltaVAsl,
        twr: r.twr,
        num_engines: r.numEngines,
        cyl_length: r.cylLength ?? 'N/A',
        cyl_fuselage: r.cylFuselage ?? 'N/A',
        nose_length: r.noseLength ?? 'N/A',
        nose_fuselage: r.noseFuselage ?? 'N/A',
      }))
      debug(parsed)
      setData(parsed)
    } catch (e) {
      console.error('Error parsing WASM JSON data:', e)
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
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // Enable multi-sort so Shift+Click will add a second-level sort
    enableMultiSort: true,
  })

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


      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className="cursor-pointer select-none"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {{
                    asc: ' 🔼',
                    desc: ' 🔽',
                  }[header.column.getIsSorted()] ?? null}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}