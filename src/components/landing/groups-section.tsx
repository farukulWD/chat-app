import { UserPlus } from "lucide-react";
import { UserAvatar } from "@/components/chat/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Eyebrow, Lede, Section, SectionHeading } from "./section";
import { Reveal } from "./reveal";

const MEMBERS = [
  { name: "You", id: "demo-you", phone: "+880 1712 000111", admin: true },
  { name: "Rafi Ahmed", id: "demo-rafi", phone: "+880 1712 000222" },
  { name: "Nusrat Jahan", id: "demo-nusrat", phone: "+880 1712 000333" },
  { name: "Tanvir Hasan", id: "demo-tanvir", phone: "+880 1712 000444" },
];

const POINTS = [
  {
    title: "Pick people, not a plan",
    body: "Search the same way you would for a one-to-one thread, select as many people as you need, name the group, and it exists.",
  },
  {
    title: "Sender colours hold",
    body: "In a group every message carries its sender's name in that person's own colour — the same colour their avatar uses everywhere else in the app.",
  },
  {
    title: "Admins can change the roster",
    body: "Add or remove members and rename the group after the fact. Everyone's list updates from the same event, and a removed member's view closes cleanly instead of erroring.",
  },
];

export function GroupsSection() {
  return (
    <Section id="groups">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16">
        <Reveal className="lg:order-2">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
              <UserAvatar name="Release crew" seed="demo-group" isGroup />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">Release crew</p>
                <p className="font-mono text-[0.6875rem] text-muted-foreground">
                  4 members · you are admin
                </p>
              </div>
            </div>

            <ul className="divide-y divide-border">
              {MEMBERS.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center gap-3 px-4 py-2.5"
                >
                  <UserAvatar
                    name={member.name}
                    seed={member.id}
                    size="sm"
                    presence={member.admin ? "online" : undefined}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{member.name}</p>
                    <p className="truncate font-mono text-[0.6875rem] text-muted-foreground">
                      {member.phone}
                    </p>
                  </div>
                  {member.admin && (
                    <Badge variant="secondary" className="shrink-0">
                      Admin
                    </Badge>
                  )}
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 border-t border-border px-4 py-3 text-sm text-primary">
              <UserPlus className="size-4" aria-hidden="true" />
              Add members
            </div>
          </div>
        </Reveal>

        <div className="lg:order-1">
          <Reveal>
            <Eyebrow>Groups</Eyebrow>
            <SectionHeading className="mt-3">
              A group is the same conversation with more people in it.
            </SectionHeading>
            <Lede className="mt-4">
              Nothing about the thread changes shape when it holds four people
              instead of one. The composer, the receipts and the scroll
              behaviour are the components you already met.
            </Lede>
          </Reveal>

          <dl className="mt-8 space-y-6">
            {POINTS.map((point, index) => (
              <Reveal key={point.title} delay={index * 70}>
                <dt className="text-base font-semibold">{point.title}</dt>
                <dd className="mt-1.5 max-w-[54ch] text-sm leading-relaxed text-muted-foreground">
                  {point.body}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  );
}
