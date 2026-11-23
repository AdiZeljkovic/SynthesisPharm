"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/blog-utils";
import { api, type RepoFile } from "../api";
import { Fields, validate } from "../fields";
import { MarkdownEditor } from "../MarkdownEditor";
import { Thumb } from "../media";
import { useSaver } from "../publish";
import { go, replaceRoute, useDirtyGuard } from "../router";
import { blogFields } from "../schema";
import { Button, Card, FieldLabel, Notice, Spinner, cx, inputCls, useConfirm } from "../ui";
import { RESERVED_SLUGS, parsePost, serializePost, slugInput, slugify, today, type PostData } from "../util";
import { EditorFrame, RequiredErrors } from "./DocEditor";

const DIR = "src/content/blog";
type Post = { slug: string; sha: string; data: PostData; body: string };

const fromFile = (f: RepoFile): Post => {
  const { data, body } = parsePost(f.content);
  return { slug: f.path.split("/").pop()!.replace(/\.md$/, ""), sha: f.sha, data, body };
};

let listCache: Post[] | null = null;

export function BlogList() {
  const [posts, setPosts] = useState<Post[] | null>(listCache);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .dir(DIR)
      .then((r) => {
        listCache = r.files.map(fromFile).sort((a, b) => b.data.date.localeCompare(a.data.date));
        setPosts(listCache);
      })
      .catch((e) => setError((e as Error).message));
  }, []);

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">Blog</h1>
          <p className="mt-1 text-sm text-muted">Članci se prikazuju od najnovijeg. Skice se ne vide na sajtu.</p>
        </div>
        <Button variant="primary" icon={<Plus className="size-4" />} onClick={() => go("/blog/novi")}>
          Novi članak
        </Button>
      </header>
      {error && <Notice tone="error">{error}</Notice>}
      {!posts && !error && <Spinner />}
      {posts && posts.length === 0 && (
        <Card>
          <p className="py-6 text-center text-sm text-muted">Još nema članaka.</p>
        </Card>
      )}
      {posts && posts.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {posts.map((p) => (
            <li key={p.slug}>
              <a href={`#/blog/${p.slug}`} className="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70 transition hover:ring-brand-300">
                <div className="relative aspect-[16/9] bg-slate-100">
                  {p.data.cover && <Thumb path={p.data.cover} w={400} className="h-full w-full object-cover" />}
                  {p.data.draft && <span className="absolute left-3 top-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-xs font-bold text-white">Skica</span>}
                </div>
                <div className="p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-600">{p.data.category}</p>
                  <p className="mt-1 line-clamp-2 font-bold text-ink group-hover:text-brand-600">{p.data.title}</p>
                  <p className="mt-1 text-xs text-muted">{/^\d{4}-\d{2}-\d{2}$/.test(p.data.date) ? formatDate(p.data.date) : p.data.date}</p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const emptyPost = (): Post => ({
  slug: "",
  sha: "",
  data: { title: "", excerpt: "", date: today(), category: "", cover: "", coverAlt: "", author: "Synthesis Pharma", products: [], draft: false },
  body: "",
});

export function BlogEditor({ slug }: { slug: string }) {
  const isNew = slug === "novi";
  const [post, setPost] = useState<Post | null>(() => (isNew ? emptyPost() : null));
  const [orig, setOrig] = useState<string>(() => (isNew ? JSON.stringify(post ?? emptyPost()) : ""));
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [newSlug, setNewSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [existing, setExisting] = useState<string[]>(listCache?.map((p) => p.slug) ?? []);
  const { save, saving, dialog } = useSaver();
  const { confirm, dialog: confirmDialog } = useConfirm();

  useEffect(() => {
    if (isNew) {
      if (!listCache) api.dir(DIR).then((r) => setExisting(r.files.map((f) => fromFile(f).slug)), () => {});
      return;
    }
    api.file(`${DIR}/${slug}.md`).then(
      (f) => {
        const p = fromFile(f);
        setPost(p);
        setOrig(JSON.stringify(p));
      },
      (e) => setError((e as Error).message),
    );
  }, [isNew, slug]);

  const dirty = !!post && JSON.stringify(post) !== orig;
  useDirtyGuard(dirty);

  const finalSlug = isNew ? slugify(slugTouched ? newSlug : (post?.data.title ?? "")) : slug;
  const slugError = useMemo(() => {
    if (!isNew) return "";
    if (!finalSlug) return "Unesite naslov (adresa se pravi iz njega).";
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(finalSlug)) return "Adresa smije imati samo mala slova, brojeve i crtice.";
    if (RESERVED_SLUGS.includes(finalSlug)) return `Adresa "${finalSlug}" je rezervisana – dodajte još neku riječ.`;
    if (existing.includes(finalSlug)) return "Članak sa ovom adresom već postoji.";
    return "";
  }, [isNew, finalSlug, existing]);

  const onSave = async () => {
    if (!post) return;
    const errs = validate(blogFields, post.data as unknown as Record<string, unknown>);
    if (!post.body.trim()) errs.push("Tekst članka");
    if (post.data.date && !/^\d{4}-\d{2}-\d{2}$/.test(post.data.date)) errs.push("Datum objave (neispravan format)");
    if (slugError) errs.push(`Adresa: ${slugError}`);
    setErrors(errs);
    if (errs.length) return;
    const path = `${DIR}/${finalSlug}.md`;
    const res = await save({
      message: `Admin: blog – ${post.data.title}`,
      files: [{ path, content: serializePost(post.data, post.body), baseSha: isNew ? null : post.sha }],
    });
    if (res) {
      const saved = { ...post, slug: finalSlug, sha: res.files[path] ?? post.sha };
      setPost(saved);
      setOrig(JSON.stringify(saved));
      listCache = null;
      if (isNew) replaceRoute(`/blog/${finalSlug}`);
    }
  };

  const onDelete = async () => {
    if (!post || isNew) return;
    const ok = await confirm("Obrisati članak?", `"${post.data.title}" će biti uklonjen sa sajta. Ovo se ne može poništiti iz admina.`, "Obriši", true);
    if (!ok) return;
    const res = await save({ message: `Admin: obrisan članak – ${post.data.title}`, deletes: [{ path: `${DIR}/${slug}.md`, baseSha: post.sha }] }, "Članak je obrisan. Sajt se ažurira za 2–4 minute.");
    if (res) {
      listCache = null;
      setOrig(JSON.stringify(post));
      setPost(null);
      go("/blog");
    }
  };

  return (
    <EditorFrame
      title={isNew ? "Novi članak" : post?.data.title || "Članak"}
      url={isNew || post?.data.draft ? undefined : `/blog/${slug}/`}
      dirty={dirty}
      saving={saving}
      onSave={onSave}
      onReset={() => {
        setPost(JSON.parse(orig));
        setErrors([]);
      }}
      back={
        <a href="#/blog" className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden /> Blog
        </a>
      }
    >
      {error && <Notice tone="error">{error}</Notice>}
      {!post && !error && <Spinner />}
      {errors.length > 0 && <RequiredErrors errors={errors} />}
      {post && (
        <>
          <Card>
            <Fields fields={blogFields.slice(0, 2)} value={post.data as unknown as Record<string, unknown>} onChange={(d) => setPost({ ...post, data: d as unknown as PostData })} />
            <div className="mt-5">
              <FieldLabel label="Adresa članka" htmlFor="post-slug" help={isNew ? "Pravi se iz naslova; nakon objave se ne mijenja." : undefined} />
              <div className="flex items-center gap-1 text-sm text-muted">
                <span className="shrink-0">/blog/</span>
                <input
                  id="post-slug"
                  className={cx(inputCls, "max-w-md font-mono", !isNew && "bg-slate-50 text-muted")}
                  value={isNew && slugTouched ? newSlug : finalSlug}
                  readOnly={!isNew}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setNewSlug(slugInput(e.target.value));
                  }}
                  onBlur={() => slugTouched && setNewSlug(slugify(newSlug))}
                />
                <span>/</span>
              </div>
              {isNew && slugError && post.data.title && <p className="mt-1 text-xs text-red-700">{slugError}</p>}
            </div>
          </Card>
          <Card title="Tekst članka">
            <MarkdownEditor value={post.body} onChange={(body) => setPost({ ...post, body })} />
          </Card>
          <Card title="Detalji">
            <Fields fields={blogFields.slice(2)} value={post.data as unknown as Record<string, unknown>} onChange={(d) => setPost({ ...post, data: d as unknown as PostData })} />
          </Card>
          {!isNew && (
            <div className="flex justify-end">
              <Button variant="danger" icon={<Trash2 className="size-4" />} onClick={onDelete} disabled={saving}>
                Obriši članak
              </Button>
            </div>
          )}
        </>
      )}
      {dialog}
      {confirmDialog}
    </EditorFrame>
  );
}
