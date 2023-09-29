import { clsx } from "clsx";
import { useState } from "react";
import { CSVLink } from "react-csv";
import Select, { ActionMeta, MultiValue } from "react-select";
import {
    COMPANY_INDUSTRIES,
    POSITION_INDUSTRIES,
    POSITION_JOB_FUNCTIONS,
} from "./options";

interface Option {
    label: string;
    value: string;
}

interface Filter {
    id: number;
    type: FilterType;
    filter: Option[];
}

type FilterType =
    | "company_industries"
    | "position_industries"
    | "position_job_functions";

const OPTIONS = {
    company_industries: toOptions(COMPANY_INDUSTRIES),
    position_industries: toOptions(POSITION_INDUSTRIES),
    position_job_functions: toOptions(POSITION_JOB_FUNCTIONS),
};

const FILTER_NAMES = {
    company_industries: "Company Industries",
    position_industries: "Position Industries",
    position_job_functions: "Position Job Functions",
};

export default function App() {
    const [id, setId] = useState(0);
    const [filters, setFilters] = useState<Filter[]>([]);

    const add = (type: FilterType) => {
        const filtersCopy = structuredClone(filters);
        filtersCopy.push({ id, type, filter: [] });
        setFilters(filtersCopy);
        setId(id + 1);
    };
    const update = (id: number, value: Option[]) => {
        const filtersCopy = structuredClone(filters);
        const idx = filtersCopy.findIndex((f) => f.id === id);
        if (idx === -1) return;
        filtersCopy[idx] = { ...filtersCopy[idx], filter: value };
        setFilters(filtersCopy);
    };
    const remove = (id: number) => {
        const filtersCopy = structuredClone(filters);
        const idx = filtersCopy.findIndex((f) => f.id === id);
        if (idx === -1) return;
        filtersCopy.splice(idx, 1);
        setFilters(filtersCopy);
    };
    const paste = (id: number) => {
        const filtersCopy = structuredClone(filters);
        const idx = filtersCopy.findIndex((f) => f.id === id);
        if (idx === -1) return;
        const value = filtersCopy[idx].filter.map((x) => x.value);
        navigator.clipboard.writeText(JSON.stringify(value));
    };

    return (
        <Layout>
            <h1 className="mt-10 mb-6 text-6xl font-bold text-center">
                Demand Filters
            </h1>
            <div className="mt-4 flex gap-4 items-center">
                <Button
                    onClick={() => add("company_industries")}
                    className="bg-yellow-100"
                >
                    + Company Industries
                </Button>
                <Button
                    onClick={() => add("position_industries")}
                    className="bg-yellow-100"
                >
                    + Position Industries
                </Button>
                <Button
                    onClick={() => add("position_job_functions")}
                    className="bg-yellow-100"
                >
                    + Position Job Functions
                </Button>
                {filters.length > 1 && (
                    <Button className="bg-green-100">
                        <CSVLink
                            data={filters.map((f) => [
                                f.type,
                                ...f.filter.map((x) => x.value),
                            ])}
                            filename="demand-filters.csv"
                            target="_blank"
                        >
                            CSV Export All ({filters.length} filters)
                        </CSVLink>
                    </Button>
                )}
            </div>
            <div className="mt-8 flex flex-col gap-8">
                {filters.map((f) => (
                    <Filter
                        key={f.id}
                        type={f.type}
                        filter={f.filter}
                        onChange={(value) => update(f.id, value)}
                        onRemove={() => remove(f.id)}
                        onExport={() => paste(f.id)}
                    />
                ))}
            </div>
        </Layout>
    );
}

function Filter({ type, filter, onChange, onRemove, onExport }) {
    return (
        <div className="flex items-center gap-2">
            <span className="w-48">{FILTER_NAMES[type]}</span>
            <Select
                className="flex-grow"
                placeholder={"Select one or more industries"}
                value={filter}
                isSearchable={true}
                isMulti={true}
                onChange={(
                    newValue: MultiValue<string>,
                    actionMeta: ActionMeta<string>
                ) => {
                    onChange([...newValue]);
                }}
                // @ts-ignore
                options={OPTIONS[type]}
            />
            <Button
                title="Export this individual filter as text"
                className="flex-grow-0 bg-green-50"
                onClick={onExport}
            >
                Single Text Export
            </Button>
            <Button
                title="Remove this filter"
                className="flex-grow-0 bg-red-500 text-white"
                onClick={onRemove}
            >
                ✕
            </Button>
        </div>
    );
}

function Layout({ children }) {
    return (
        <>
            <div className="mx-auto max-w-4xl">{children}</div>
        </>
    );
}

interface ButtonProps
    extends React.DetailedHTMLProps<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        HTMLButtonElement
    > {
    children?: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

function Button({ children, onClick, ...props }: ButtonProps) {
    return (
        <button
            type="button"
            className={clsx(
                "border px-4 py-2 rounded-lg font-medium",
                props.className
            )}
            onClick={onClick}
        >
            {children}
        </button>
    );
}

function toOptions(input: string[]): Option[] {
    return input.map((i) => ({ value: i, label: i }));
}
