const stringRule = (strings: string[], column:string, input:string, rule:string) => `${column} ${rule} ${strings[1]}:${input}${strings[2]}`;

const jsonRule = (_:any, column:string, input:string) => `:${input} IN (SELECT value from json_each_text(${column}))`;


// export  const searchBy = (name:string,  value: string, rule = '=', param = 'searchTerm',) => ({
//     param: param,
//     paramValue: rule === 'like' ? `%${value}%` : value,
//     builder: (alias: string) => {
//       const columnName = `${alias}.${name}`;
//       if (rule === 'json') {
//         return jsonRule`${columnName}${param}`;
//       }
//       return rule === '='
//         ? stringRule`${columnName}${param}${rule}`
//         : stringRule`${columnName}${param}${rule}`;
//     }
//   })
