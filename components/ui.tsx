export function Currency({ value }) { return <>{new Intl.NumberFormat(undefined,{style:'currency',currency:'USD'}).format(value)}</> }
