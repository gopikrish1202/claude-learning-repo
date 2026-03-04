import { test, expect, afterEach, describe } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallDisplay } from "../ToolCallDisplay";

afterEach(() => {
  cleanup();
});

describe("str_replace_editor — create", () => {
  test("shows 'Creating' and filename when pending", () => {
    render(
      <ToolCallDisplay
        toolName="str_replace_editor"
        args={{ command: "create", path: "/App.jsx" }}
        state="call"
      />
    );
    expect(screen.getByText("Creating")).toBeDefined();
    expect(screen.getByText("App.jsx")).toBeDefined();
  });

  test("shows 'Created' and no spinner when done", () => {
    const { container } = render(
      <ToolCallDisplay
        toolName="str_replace_editor"
        args={{ command: "create", path: "/App.jsx" }}
        state="result"
      />
    );
    expect(screen.getByText("Created")).toBeDefined();
    expect(screen.queryByText("Creating")).toBeNull();
    expect(container.querySelector(".animate-spin")).toBeNull();
  });
});

describe("str_replace_editor — str_replace", () => {
  test("shows 'Editing' when pending", () => {
    render(
      <ToolCallDisplay
        toolName="str_replace_editor"
        args={{ command: "str_replace", path: "/components/Button.tsx" }}
        state="call"
      />
    );
    expect(screen.getByText("Editing")).toBeDefined();
    expect(screen.getByText("Button.tsx")).toBeDefined();
  });

  test("shows 'Edited' when done", () => {
    render(
      <ToolCallDisplay
        toolName="str_replace_editor"
        args={{ command: "str_replace", path: "/components/Button.tsx" }}
        state="result"
      />
    );
    expect(screen.getByText("Edited")).toBeDefined();
  });
});

describe("str_replace_editor — insert", () => {
  test("shows 'Editing' when pending", () => {
    render(
      <ToolCallDisplay
        toolName="str_replace_editor"
        args={{ command: "insert", path: "/App.jsx" }}
        state="call"
      />
    );
    expect(screen.getByText("Editing")).toBeDefined();
  });

  test("shows 'Edited' when done", () => {
    render(
      <ToolCallDisplay
        toolName="str_replace_editor"
        args={{ command: "insert", path: "/App.jsx" }}
        state="result"
      />
    );
    expect(screen.getByText("Edited")).toBeDefined();
  });
});

describe("str_replace_editor — view", () => {
  test("shows 'Reading' when pending", () => {
    render(
      <ToolCallDisplay
        toolName="str_replace_editor"
        args={{ command: "view", path: "/App.jsx" }}
        state="call"
      />
    );
    expect(screen.getByText("Reading")).toBeDefined();
  });

  test("shows 'Read' when done", () => {
    render(
      <ToolCallDisplay
        toolName="str_replace_editor"
        args={{ command: "view", path: "/App.jsx" }}
        state="result"
      />
    );
    expect(screen.getByText("Read")).toBeDefined();
  });
});

describe("str_replace_editor — undo_edit", () => {
  test("shows 'Reverting' when pending", () => {
    render(
      <ToolCallDisplay
        toolName="str_replace_editor"
        args={{ command: "undo_edit", path: "/App.jsx" }}
        state="call"
      />
    );
    expect(screen.getByText("Reverting")).toBeDefined();
  });

  test("shows 'Reverted' when done", () => {
    render(
      <ToolCallDisplay
        toolName="str_replace_editor"
        args={{ command: "undo_edit", path: "/App.jsx" }}
        state="result"
      />
    );
    expect(screen.getByText("Reverted")).toBeDefined();
  });
});

describe("file_manager — rename", () => {
  test("shows 'Renaming' and source filename when pending", () => {
    render(
      <ToolCallDisplay
        toolName="file_manager"
        args={{ command: "rename", path: "/OldName.tsx", new_path: "/NewName.tsx" }}
        state="call"
      />
    );
    expect(screen.getByText("Renaming")).toBeDefined();
    expect(screen.getByText("OldName.tsx")).toBeDefined();
  });

  test("shows 'Renamed' when done", () => {
    render(
      <ToolCallDisplay
        toolName="file_manager"
        args={{ command: "rename", path: "/OldName.tsx", new_path: "/NewName.tsx" }}
        state="result"
      />
    );
    expect(screen.getByText("Renamed")).toBeDefined();
  });
});

describe("file_manager — delete", () => {
  test("shows 'Deleting' when pending", () => {
    render(
      <ToolCallDisplay
        toolName="file_manager"
        args={{ command: "delete", path: "/App.jsx" }}
        state="call"
      />
    );
    expect(screen.getByText("Deleting")).toBeDefined();
  });

  test("shows 'Deleted' when done", () => {
    render(
      <ToolCallDisplay
        toolName="file_manager"
        args={{ command: "delete", path: "/App.jsx" }}
        state="result"
      />
    );
    expect(screen.getByText("Deleted")).toBeDefined();
  });
});

describe("filename extraction", () => {
  test("shows only the basename from a deeply nested path", () => {
    render(
      <ToolCallDisplay
        toolName="str_replace_editor"
        args={{ command: "create", path: "/components/ui/Button.tsx" }}
        state="call"
      />
    );
    expect(screen.getByText("Button.tsx")).toBeDefined();
    expect(screen.queryByText("/components/ui/Button.tsx")).toBeNull();
  });

  test("shows filename for root-level files", () => {
    render(
      <ToolCallDisplay
        toolName="str_replace_editor"
        args={{ command: "create", path: "/App.jsx" }}
        state="call"
      />
    );
    expect(screen.getByText("App.jsx")).toBeDefined();
  });
});

describe("spinner / checkmark states", () => {
  test("shows spinner for partial-call state", () => {
    const { container } = render(
      <ToolCallDisplay
        toolName="str_replace_editor"
        args={{ command: "create", path: "/App.jsx" }}
        state="partial-call"
      />
    );
    expect(container.querySelector(".animate-spin")).toBeDefined();
  });

  test("shows spinner for call state", () => {
    const { container } = render(
      <ToolCallDisplay
        toolName="str_replace_editor"
        args={{ command: "create", path: "/App.jsx" }}
        state="call"
      />
    );
    expect(container.querySelector(".animate-spin")).toBeDefined();
  });

  test("no spinner for result state", () => {
    const { container } = render(
      <ToolCallDisplay
        toolName="str_replace_editor"
        args={{ command: "create", path: "/App.jsx" }}
        state="result"
      />
    );
    expect(container.querySelector(".animate-spin")).toBeNull();
  });
});

describe("fallback behavior", () => {
  test("renders tool name for completely unknown tool", () => {
    render(
      <ToolCallDisplay toolName="unknown_tool" args={{}} state="call" />
    );
    expect(screen.getByText("unknown_tool")).toBeDefined();
  });

  test("renders tool name when command is unrecognized", () => {
    render(
      <ToolCallDisplay
        toolName="str_replace_editor"
        args={{ command: "unknown_cmd", path: "/App.jsx" }}
        state="call"
      />
    );
    expect(screen.getByText("str_replace_editor")).toBeDefined();
  });

  test("renders tool name when args are empty (partial-call with no data)", () => {
    render(
      <ToolCallDisplay
        toolName="str_replace_editor"
        args={{}}
        state="partial-call"
      />
    );
    expect(screen.getByText("str_replace_editor")).toBeDefined();
  });

  test("fallback shows spinner when pending", () => {
    const { container } = render(
      <ToolCallDisplay toolName="unknown_tool" args={{}} state="call" />
    );
    expect(container.querySelector(".animate-spin")).toBeDefined();
  });

  test("fallback shows no spinner when done", () => {
    const { container } = render(
      <ToolCallDisplay toolName="unknown_tool" args={{}} state="result" />
    );
    expect(container.querySelector(".animate-spin")).toBeNull();
  });
});
