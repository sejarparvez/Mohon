import Loading from "@/components/common/loading/Loading";
import { FetchUserCount } from "@/components/fetch/admin/FetchUserCount";
import { Card } from "@/components/ui/card";
import { FaUsers } from "react-icons/fa";

export default function UserCard() {
  const { isLoading, data, isError } = FetchUserCount();
  return (
    <>
      {isLoading ? (
        <div className="m-3">
          <Loading />
        </div>
      ) : isError ? (
        <p>Error loading data. Please try again later.</p>
      ) : (
        <Card className="p-3">
          <div className="flex items-center gap-6">
            <div className="flex flex-col gap-2">
              <div className="text-4xl font-bold">{data.totalUser}</div>
              <div>Total User</div>
              <div className="flex flex-wrap gap-1">
                <span
                  className={
                    data.percentage > 0 ? "text-primary" : "text-red-500"
                  }
                >
                  {data.percentage} % {data.percentage >= 0 ? "More" : "less"}
                </span>
                <span>Then Last Month</span>
              </div>
            </div>
            <div className="mx-auto flex items-center justify-center text-primary">
              <FaUsers size={60} />
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
