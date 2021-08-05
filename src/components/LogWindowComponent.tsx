import { useEffect, useState, useRef } from "react";
import { Button, TextField } from "@material-ui/core";

export function LogWindowComponent(props: { logData: string[] }) {

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [autoScrollToBottom, setAutoScrollToBottom] = useState<boolean>(true);
  const [filterText, setFilterText] = useState<string>("");

  useEffect(() => {
    if (autoScrollToBottom) {
      messagesEndRef.current?.scrollTo({ top: messagesEndRef.current?.scrollHeight, behavior: 'auto' });
    }
  }, [props.logData, autoScrollToBottom]);

  return (
    <div>
      <TextField
        InputLabelProps={{ shrink: true }}
        label="Filter"
        variant="outlined"
        style={{ margin: 5, width: 200 }}
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
      />
      <Button onClick={() => setAutoScrollToBottom(x => !x)} variant="outlined" style={{ margin: 5 }}>AutoScroll to Bottom ({autoScrollToBottom.toString()})</Button>
      <div ref={messagesEndRef} style={{ margin: 5, padding: 15, backgroundColor: "#241d1d", height: "80vh", overflowY: "scroll" }}>
        {
          filterText !== '' ?
            props.logData.filter(x => x.includes(filterText)).map((x, i) => <div key={i} style={{ marginBottom: 5 }}>{x}</div>)
            :
            props.logData.map((x, i) => <div key={i} style={{ marginBottom: 5 }}>{x}</div>)}
      </div>
    </div>
  );
}