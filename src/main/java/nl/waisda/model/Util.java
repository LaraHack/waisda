/*  This file is part of Waisda 

    Copyright (c) 2012 Netherlands Institute for Sound and Vision
    https://github.com/beeldengeluid/waisda
	
    Waisda is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Waisda is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Waisda.  If not, see <http://www.gnu.org/licenses/>.
*/

package nl.waisda.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class Util {

	public static final Locale DUTCH_LOCALE = new Locale("NL", "nl");
	public static final Locale ENGLISH_LOCALE = Locale.ENGLISH;

	private Util() {

	}

	public static <T> List<T> mapGet(List<Value<T>> values) {
		List<T> ts = new ArrayList<T>(values.size());
		for (Value<T> v : values) {
			ts.add(v.get());
		}
		return ts;
	}

}
