import AdminProjects from '../../components/AdminProjects.jsx';

export default function AdminProjectEdit({ id }) {
  return <AdminProjects forcedMode="edit" forcedId={id} />;
}
