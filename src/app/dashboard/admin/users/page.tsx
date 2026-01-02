
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const users = [
    { id: 'usr_1', name: 'John Doe', email: 'john.d@example.com', role: 'student', status: 'Active' },
    { id: 'usr_2', name: 'Jane Smith', email: 'jane.s@example.com', role: 'admin', status: 'Active' },
    { id: 'usr_3', name: 'Sam Wilson', email: 'sam.w@example.com', role: 'student', status: 'Inactive' },
]

export default function ManageUsersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Users</CardTitle>
        <CardDescription>
          A list of all users in the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                </TableCell>
                <TableCell>
                     <Badge variant={user.status === 'Active' ? 'outline' : 'destructive'}>{user.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
