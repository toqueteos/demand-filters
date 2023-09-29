import { clsx } from "clsx";
import { useState } from "react";
import { CSVLink } from "react-csv";
import Select, { ActionMeta, MultiValue } from "react-select";
import { INDUSTRIES } from "./industries";

interface Option {
    label: string;
    value: string;
}

const options = INDUSTRIES.map((i) => ({ value: i, label: i }));

export default function App() {
    const [id, setId] = useState(0);
    const [filters, setFilters] = useState<{ id: number; filter: Option[] }[]>(
        []
    );

    const add = () => {
        const filtersCopy = structuredClone(filters);
        filtersCopy.push({ id, filter: [] });
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
                Demand Industries Filters
            </h1>
            <div className="mt-4 flex gap-4 items-center">
                <Button onClick={() => add()}>Create New Filter</Button>
                {filters.length > 0 && (
                    <Button>
                        <CSVLink
                            data={filters.map((f) =>
                                f.filter.map((x) => x.value)
                            )}
                            filename="industry-filters.csv"
                            target="_blank"
                        >
                            {filters.length === 1
                                ? "Export filter"
                                : `Export All (${filters.length} filters)`}
                        </CSVLink>
                    </Button>
                )}
            </div>
            <div className="mt-8 flex flex-col gap-8">
                {filters.map((f) => (
                    <Filter
                        key={f.id}
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

function Filter({ filter, onChange, onRemove, onExport }) {
    return (
        <div className="flex items-center gap-2">
            <Select
                className="flex-grow"
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
                options={options}
            />
            <Button className="flex-grow-0" onClick={onExport}>
                Export filter
            </Button>
            <Button
                className="flex-grow-0 bg-red-600 text-white"
                onClick={onRemove}
            >
                X
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
