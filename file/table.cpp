#include "table.h"

bool Table::feasible(int r, int g, int b){				//fesible 함수에선, 현재 풍선의 갯수가 테이블을 꾸미기에 적합한지에 대해 판단한다.즉 3개 이상이면 true를 리턴하되,
	if (r + g + b >= 3){								//풍선의 갯수의 합이 3개 이상이라도 모두 한종류의 풍선이라면 테이블을 꾸미는 것이 불가능하므로 false를 리턴한다.
		if (r + g == 0 || r + b == 0 || g + b == 0){
			return false;
		}
		return true;
	}
	else{												//현재 풍선의 갯수가 3개 미만이라 테이블을 꾸미지 못한다면 false를 리턴한다.
		return false;
	}
}

int Table::select(int &r, int &g, int &b){				//select함수는 풍선의 갯수를 받아서 당장 테이블을 꾸미는데 어떤 풍선을 사용할지에 대해 결정한다.
	if (r >= g && g>= b){								//가장 많은 풍선이 가장 가치가 없으므로 2개를 쓰고 나머지 두 풍선중 가치없는 풍선에서 하나를 사용해 테이블 하나를 꾸민다.
		if (r >= 2)										//그렇게 테이블 하나를 꾸민 후에 남은 풍선의 개수를 리턴해준다.
			r -= 2, g -= 1;
		else if (r == 1)
			r -= 1, g -= 1, b -= 1;
	}
	else if (r >= b && b >= g){
		if (r >= 2)
			r -= 2, b -= 1;
		else if (r == 1)
			r -= 1, g -= 1, b -= 1;
	}
	else if (g >= r && r >= b){
		if (g >= 2)
			g -= 2, r -= 1;
		else if (g == 1)
			r -= 1, g -= 1, b -= 1;
	}
	else if (g >= b && b >= r){
		if (g >= 2)
			g -= 2, b -= 1;
		else if (g == 1)
			r -= 1, g -= 1, b -= 1;
	}
	else if (b >= r && r >= g){
		if (b >= 2)
			b -= 2, r -= 1;
		else if (b == 1)
			r -= 1, g -= 1, b -= 1;
	}
	else if (b >= g && g >= r){
		if (b >= 2)
			b -= 2, g -= 1;
		else if (b == 1)
			r -= 1, g -= 1, b -= 1;
	}
	return r, g, b;  //테이블 하나를 꾸미고 남은 풍선의 갯수를 리턴해준다.
}